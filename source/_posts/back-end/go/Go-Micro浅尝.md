---
title: Go-Micro 浅尝 ( 微服务之Go-Micro实践 )
date: 2019-05-21
tags:
  - 微服务
---

### 实践地址

https://github.com/littleTommyTan/orange

**Go-Micro 框架文档**

https://micro.mu/
https://micro.mu/docs/index.html
![arc.png](/images/orange/arc.png)
![basic.png](/images/orange/basic.png)

<!-- more -->

### 快速开始

安装 protobuf、proto-gen-go、micro-cli

```bash
// 设置环境变量
export GO111MODULE=on | export GOPROXY=https://goproxy.io
sudo apt install protobuf-compiler
go get github.com/golang/protobuf/protoc-gen-go
go get github.com/micro/protoc-gen-micro
go get -u github.com/micro/micro
```

得如图 bin 文件：
![proto.png](/images/orange/proto.jpg)

### 利用 micro-cli 创建微服务 micro new srv/web

新建一个微服务 hi

```bash
micro new --type "srv" --fqdn orange.srv.hi github.com/littletommytan/orange/hi-srv --alias hi
cd /home/littletommytan/go/src/github.com/littletommytan/orange/hi-srv
#protoc --proto_path=.:$GOPATH/src --go_out=. --micro_out=. proto/hi/hi.proto
make proto
# export GO111MODULE=on | export GOPROXY=https://goproxy.io
# go mod init
go mod vendor

```

同理

```bash
micro new --type "web" --fqdn orange.web.hi github.com/littletommytan/orange/hi-web --alias hi
```

然后修改一下 hi-web/handler/handler.go 中的 proto path 和 client.serviceName

### 启动服务 Go run main.go(each)

此时一个微服务的 srv 和 web 均已启动，两个服务均注册至 mdns，访问成功。

### 配置读取

Profiles 读取 Conf 中的 application-xxx.yml 配置，

### User-Srv 及 User-Web

#### Api Test

```bash
# 注册
curl -X POST --url http://www.tommytan.io:8080/user/join   --header 'Content-Type: application/json'  --data '{"username":"littletommytan","email":"tommytandm@foxmail.com","pwd":"12345"}'
# 登录
curl -X POST --url http://www.tommytan.io:8080/user/login   --header 'Content-Type: application/x-www-form-urlencoded'  --data 'userName=littletommytan&pwd=12345'
# ab并发
ab -n 1000 -c 100 -T 'application/json' -p /Users/tommytan/Downloads/Untitled-1.json http://127.0.0.1:8080/user/join
```

#### Error handling in Gorm

gorm 目前只有 record not found 的异常，且因为 micro.proto 的机制的问题（初步怀疑，无考究），rpc 调用返回 error 就不会携带 response 即 rsp 为空，故全项目不再使用对默认的 error 作异常处理，转为 errcode 机制，如下图 1 两个 rsp，其中 Error 类型为{code,message}，且 rpc 返回的 error 始终为 nil，故 user-web 对异常的处理形式如下图 2，看上去还蛮精致（暂未出现问题，先这样用着吧）。

![e2.png](/images/orange/error2.png)

#### Use Gin for web

Gin 的 webserver 集成还是足够强悍的，因为项目中会持续使用 gin 对外提供 http 服务。使用到一些 Gin 的 c.ShouldBind、c.Json 的东西，详情查看 commit detail

#### Copy Proto

我不太清楚 proto 是否要拷贝一份到 user-web 目录下（如果不拷贝就需要引用到 user-srv 的 proto，至少我认为而且比较推荐还是解掉这个耦合比较好，就是开发的时候要注意一下修改了要替换，包括其他模块的 rpc 调用）

### Post-Srv 及 Post-Web

#### Protobuf 自定义业务有效负载（区别于存储数据） & Gorm 的聚合 Aggregation

业务中要求返回所有的 Tag，如下：

```json
{
  "golang": 3,
  "nodejs": 2,
  "动漫": 5
}
```

它是聚合数据，使用 sql 语句查询较便捷，查询操作如下：

```go
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

handler 中也使用 TagCollection 作为 rpc 调用的 payload。

#### Gorm 的 One2Many 一对多关系的操作

<img src="/images/orange/1toMany.png" width="40%"/>

```go
p := &Post{Title: title, Body: body}
// Model.Association.Append
dao.GetDB().Model(&p).Association("Tags").Append(tags).Error

```

通过 DB.Model.Association.Append，Post.ID 将会自动写入 Tag.PostID
