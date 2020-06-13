---
title: 高并发下怎么做余额扣减？（摘抄）
date: 2019-09-08
tags:
  - Java
---

余额操作在大多数系统都是不可缺少和不允许出现问题的   如何修改余额 , 这个问题可能在实际项目中 没那么简单;
如何修改余额
假设一个用户数据   :   
id⇒12 | user_name⇒放放  |  fee⇒ 30  | updated_at ⇒ 2019-09-06 15:51:33
修改余额
```
//消费金额
$spend = 10;

//查询用户余额
$user = select id,fee from `users` where id = 12;

//计算金额
$newFee = $user['fee']-$spend;

//.. 这里检查余额是否足够

//更新余额
update `users` set fee = $newFee  where id = 12 ;
```

按照正常逻辑来说上面更新余额是没问题的
但是如果发生并发  当 A 跟  B  同时发起请求时 
请求A  查询出余额为 30
请求B 查询出余额为 30
请求B 更新余额为20
请求A 更新余额为20
最终用户余额为  20
也就是说 用户余额为30  两个请求都消费了  10元  即  30 - 10 -10 =10  但是当发生并发请求时  余额最终为20   这里的金额是错误的
在请求B 修改了  余额之后  请求A的查询出来的余额已经不是正确的了 导致了  余额更新错误
常见的解决办法  添加数据库的行锁
当请求A 执行时  先加入锁  阻塞  请求B直到  请求A完成之后  请求B  才继续执行
当然使用事务 并不是那么明智

```
//开始事务
begin;

//消费金额
$spend = 10;

//查询用户余额
$user = select id,fee from `users` where id = 12 for update;

//计算金额
$newFee = $user['fee']-$spend;

//.. 这里检查余额是否足够

//更新余额
update `users` set fee = $newFee where id = 12  ;

//确认成功之后  提交事务
commit


CAS  业务层面乐观锁
什么是  CAS
在更新的时候使用初始值(即查询出来的当前余额)作为条件 compare 限制只有当初始值没有改变时才允许更新成功 set 
Compare And Set（CAS）
使用该方式  修改  更新语句

//消金额
$spend = 10;

//查询用户余额
$user = select id,fee from `users` where id = 12;
$oldFee = $user['fee'];
//计算金额
$newFee = $user['fee']-$spend;

//.. 这里检查余额是否足够

//更新余额
update `users` set fee = $newFee   where id = 12 and fee = $oldFee ;
```

这里如果发生同时修改产生并发  将只有一边修改成功    这时候如果产生失败 可以对他进行重试等操作
为什么不使用  减等于  的sql语句
例如  :
update users set fee = fee - $spend where id = 12 ;
这里要再加上余额的判断避免出现  负数金额
update users set fee = fee - $spend where id = 12 and fee >= $spend ;
稍微改一下这里的更新  语句 也能完成正确的更新 就算是并发也都将正常
但是这样做将产生一个问题   不幂等  
什么是不幂等  ?
在相同的条件下 , 执行同一请求,得到的结果相同才符合幂等性

也即是说     
fee = fee - $spend  不幂等
fee = $newFee         幂等


不幂等的情况下 如果发生重复执行的情况将产生重复扣款
事实上实际业务如何正确的扣款 根据业务的实际情况 可能需要注意更多细节 , 越大的业务量,需要面对更多的问题处理更多的细节. 以上的方案也仅仅是最基础的处理 实际情况需要更多的耐心和思考 共勉之 ~
以上.

