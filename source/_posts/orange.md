---
title: Orange with Go-Micro ( 微服务之Go-Micro实践 )
date: 2019-05-21
tags:
  - 微服务
  - golang
---

### 实践地址
https://github.com/littleTommyTan/orange

###### Go-Micro框架文档
https://micro.mu/
https://micro.mu/docs/index.html
![arc.png](/images/orange/arc.png)
![basic.png](/images/orange/basic.png)


<!-- more -->

### Quick Start
安装protobuf、proto-gen-go、micro-cli
``` bash
// 设置环境变量
export GO111MODULE=on | export GOPROXY=https://goproxy.io
sudo apt install protobuf-compiler 
go get github.com/golang/protobuf/protoc-gen-go
go get github.com/micro/protoc-gen-micro
go get -u github.com/micro/micro
```

得如图bin文件：
![proto.png](/images/orange/proto.jpg)

### 利用cli创建微服务micro new srv/web 

新建一个微服务hi
``` bash
micro new --type "srv" --fqdn orange.srv.hi github.com/littletommytan/orange/hi-srv --alias hi
cd /home/littletommytan/go/src/github.com/littletommytan/orange/hi-srv
#protoc --proto_path=.:$GOPATH/src --go_out=. --micro_out=. proto/hi/hi.proto
make proto
# export GO111MODULE=on | export GOPROXY=https://goproxy.io
# go mod init
go mod vendor

```

同理

``` bash
micro new --type "web" --fqdn orange.web.hi github.com/littletommytan/orange/hi-web --alias hi
```

然后修改一下hi-web/handler/handler.go中的proto path和client.serviceName

### go run main.go(each)

此时一个微服务的srv和web均已启动，两个服务均注册至mdns，访问成功。

### Basic and Conf
Profiles 读取 Conf 中的 application-xxx.yml 配置，

### User-srv & User-web

#### Api Test
``` bash 
# 注册
curl -X POST --url http://www.tommytan.io:8080/user/join   --header 'Content-Type: application/json'  --data '{"username":"littletommytan","email":"tommytandm@foxmail.com","pwd":"12345"}'
# 登录
curl -X POST --url http://www.tommytan.io:8080/user/login   --header 'Content-Type: application/x-www-form-urlencoded'  --data 'userName=littletommytan&pwd=12345'
# ab并发
ab -n 1000 -c 100 -T 'application/json' -p /Users/tommytan/Downloads/Untitled-1.json http://127.0.0.1:8080/user/join
```

#### Error handling in Gorm

gorm目前只有record not found的异常，且因为micro.proto的机制的问题（初步怀疑，无考究），rpc调用返回error就不会携带response即rsp为空，故全项目不再使用对默认的error作异常处理，转为errcode机制，如下图1两个rsp，其中Error类型为{code,message}，且rpc返回的error始终为nil，故user-web对异常的处理形式如下图2，看上去还蛮精致（暂未出现问题，先这样用着吧）。

![e2.png](/images/orange/error2.png)

#### Use Gin for web
Gin的webserver集成还是足够强悍的，因为项目中会持续使用gin对外提供http服务。使用到一些Gin的c.ShouldBind、c.Json的东西，详情查看commit detail

#### Copy Proto
我不太清楚proto是否要拷贝一份到user-web目录下（如果不拷贝就需要引用到user-srv的proto，至少我认为而且比较推荐还是解掉这个耦合比较好，就是开发的时候要注意一下修改了要替换，包括其他模块的rpc调用）

### Post-srv & Post-web

#### Protobuf自定义业务有效负载（区别于存储数据） & Gorm的聚合Aggregation

业务中要求返回所有的Tag，如下：
``` json
{
  "golang": 3,
  "nodejs": 2,
  "动漫":5
}
```
它是聚合数据，使用sql语句查询较便捷，查询操作如下：
``` go
const sql = 
`select t."name",count(*) total from tags t group by t."name"`
// 查询出所有的 row
rows, err := dao.GetDB().Raw(sql).Rows()
// defer close
defer rows.Close()
for rows.Next() {
  tc := &TagCollection{}
  ptc := &postPb.TagCollection{}
  _ = dao.GetDB().ScanRows(rows, tc)

  b, _ := json.Marshal(tc)
  err := json.Unmarshal(b, ptc)
  if err != nil {
    return nil, &postPb.Error{Code: 1, Message: err.Error()}
  }
  tags = append(tags, ptc)
}
// 然后将 tags:[]TagCollection 返回
return tags

```
handler中也使用TagCollection作为rpc调用的payload。

#### Gorm的One2Many一对多关系的操作

![1toM.png](/images/orange/1tomany.png)
``` go
p := &Post{Title: title, Body: body}
// Model.Association.Append
dao.GetDB().Model(&p).Association("Tags").Append(tags).Error

```
通过DB.Model.Association.Append，Post.ID将会自动写入Tag.PostID
