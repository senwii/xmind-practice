# Xmind-Practice

> xmind前端面试题

## 截图
![](https://raw.githubusercontent.com/senwii/xmind-practice/master/screenshot.png)
​

## 录屏
[demo.mov](https://raw.githubusercontent.com/senwii/xmind-practice/master/demo.mov)
​

## 在线地址
https://senwii.ink/app/xmind-practice-client/​

​
## 配置
操作系统：CentOS v7.8.2003

服务器：NodeJS v10.20.1

数据库：Redis v6.0.4

浏览器：推荐使用新版Chrome|Firefox浏览器访问​​

​
## 运行
1. 设置Redis密码，启动服务，默认端口6379，无密码
2. 启动NodeJs服务，端口：8085
3. 运行本地前端项目，端口：8081
4. 打开浏览器，访问：https://localhost:8081

``` shell
# 注：打开页面提示跨域问题，请在命令行中执行以下命令（禁用浏览器安全模式下打开Chrome浏览器）：
open -n /Applications/Google\ Chrome.app/ --args --disable-web-security  --user-data-dir=~/Desktop/MyChromeDevUserData
```

​
## 思路
第一遍看完题目时，感觉这是一个虽然简单但是比较完整的账单应用；需要存取、新增、筛选、统计数据，（一个流程完整的应用应该还有删除账单功能）；另外一个账单自身具有时间属性，展示时按照产生时间先后排列，是一个比较自然地选择，就需要进行排序；这些涉及到数据库和后端接口提供服务；需要在界面操作，就涉及前端页面实现；因为之前没有过“跨端”的经验，对这么有趣的题目很感兴趣，正好拿来挑战下自己

### 技术选型
#### 数据库
工作中没有实际数据库开发经验，所以也没有擅长的数据库选择，且考虑到快速上手，账单按时间、类型排序等需求，（另外还有Mongodb国内下载太慢的原因），最终选择了使用Redis做数据存储

#### 服务端
让前端开发者几乎零门槛接触服务端开发的，毫无疑问是Nodejs。这个需求只需要提供几个Rest Api接口供前端消费，Express和Koa都比较适合。这里选了Koa2。因为相比Express的回调，Koa的洋葱模型提供了在请求和返回时两次处理数据的机会，更为强大；而Koa2的async语法，比Koa1的Generator更优雅

使用PM2对Node应用进行进程管理，其包含的性能监控、自动重启等功能方便开发和部署应用

#### 前端
因为近期工作内容主要是维护React项目 && 喜欢React的简洁和函数式 && Hooks学以致用，前端技术栈采用React + Hooks

​
## 设计
### 数据库
命名空间：xmind-practice

```
功能：账单详情
类型：Hash
名称：bill:<$id>
字段：
         键               值                描述
         id             string     唯一字符串id，跟$<id>一一对应
        type             0|1           0：支出 1：收入
        time             int             创建时间戳
      category          string        账单类目字符串id
       amount           number            账单金额
    categoryName        string           账单类目描述
```
```
功能：账单字符串到id的映射
类型：Hash
名称：bill:idstr-id-hash
字段：
            键             值              描述
        6aa7af68e7         1             bill:1
        980f902b43         2             bill:2
            ⋮               ⋮               ⋮
        05dd9f6a41         9             bill:9
```
```
功能：按时间筛选|排序账单
类型：Sorted Set
名称：bill:timestamp-key-zset
字段：
        score        value
    1561910400000    bill:1
    1561910400000    bill:2
         ⋮              ⋮
    1577345477581    bill:39
```
```
功能：按类目筛选账单
类型：Sorted Set
名称：bill:categoryid-time_key-zset
字段：
       score      value
         1       1569772800000_bill:17
         1       1574870400000_bill:27
         ⋮          ⋮
         5       1577345333184_bill:35
```
```
功能：按月份筛选账单
类型：Sorted Set
名称：bill:month-time_key-zset
字段：
    score    value
      7     1561910400000_bill:1
      7     1561910400000_bill:2
      ⋮        ⋮
      12    1577345333184_bill:35
```
```
功能：账单id列表
类型：List
名称：bill:id-list
字段：
    index    value
      0        1
      1        2
      ⋮        ⋮
      45      46
```
```
功能：类目详情
类型：Hash
名称：category:<$id>
字段：
         键                值               描述
         id              string     跟<$id>一一对应的字符串
        type              0|1           0：支出 1：收入
        name             string          账单类目描述
```
```
功能：类目字符串到id的映射
类型：Hash
名称：category:idstr-id-hash
字段：
            键             值              描述
        1bcddudhmh         1              车贷
        hc5g66kviq         2             车辆保养
            ⋮               ⋮               ⋮
        8s0p723            3              房贷
```
```
功能：类目id列表
类型：List
名称：category:id-list
字段：
    index    value
      0        1
      1        2
      ⋮        ⋮
      10      11
```
### 服务端
-​ 涉及到账单列表的，默认按照时间升序返回

#### 一些思考
1. helmet：安全相关请求头设置
2. 内网访问：公网发布后，不能直接通过端口号访问api；需要通过Nginx转发到api服务端口
3. 服务器限流，避免密集请求导致服务器宕机：koa-toobusy
4. 并发竞态问题：假设同时发起多个添加账单请求，由于账单id是自增的，在并发生成id时存在竞态问题，导致id重复，通过Redis `setnx`、`getset`指令设置锁解决
5. 反爬虫：账单属于敏感信息，且账单id自增，可能通过爬虫爬取到账单信息；解决：对账单id+随机数计算摘要，并与id一一映射（Hash），对外通过摘要充当账单id，真实的账单id不对外暴露
6. 数值计算：使用BigInt进行运算，结果再转为浮点数，保留两位精度小数
7. 优化加载速度：路由懒加载；nginx gzip；

#### Restful api设计
```
功能：获取符合条件的账单列表
路径：/getBillList?month=&category=
方法：GET
参数：
      名称      必填       值          描述
      month     否       1-12         月份
    category    否      string      账单类目字符串id
返回结果：
    - 成功：
    {
      "code": 200,
      "data": {
        "list": [
          {
            "id": "cf38dcc63e",
            "type": 0,
            "time": 1564588800000,
            "categoryId": "0fnhbcle6hg",
            "categoryName": "房屋租赁",
            "amount": "1500.00"
          },
          {
            "id": "6bdc70ce43",
            "type": 0,
            "time": 1564588800000,
            "categoryId": "8s0p77c323",
            "categoryName": "房贷",
            "amount": "5400.00"
          },
          {
            "id": "fd3027804e",
            "type": 1,
            "time": 1567094400000,
            "categoryId": "1vjj47vpd28",
            "categoryName": "股票投资",
            "amount": "3000.00"
          }
        ],
        "income": "3000.00",
        "expend": "6900.00"
      }
    }
    - 失败：
    {
      "code": 400,
      "error": "月份必须是正整数"
    }
```
```
功能：新增一条账单记录
路径：/addBill?time=&category=&amount=
方法：POST
参数：
      名称       必填       值            描述
      time       是        int         日期时间戳
    category     是       string        账单类目
     amount      是       number        账单金额
返回结果：
    - 成功：
    {
      "code": 200,
      "data": "添加成功"
    }
    - 失败：
    {
      "code": 400,
      "error": "类目不存在"
    }
```
```
功能：删除一条账单记录
路径：/delBill?id=
方法：DELETE
参数：
      名称       必填       值          描述
      id         是       int         账单id
返回结果：
    - 成功：
    {
      "code": 200,
      "data": "删除成功"
    }
    - 失败：
    {
      "code": 400,
      "error": "账单不存在"
    }
```
```
功能：获取类目列表
路径：/getAllCategory
方法：GET
参数：无
返回结果：
    - 成功：
    {
      "code": 200,
      "data": [
        {
          "id": "1bcddudhmh",
          "type": 0,
          "name": "车贷"
        },
        {
          "id": "5il79e11628",
          "type": 1,
          "name": "基金投资"
        }
      ]
    }
    - 失败：
    {
      "code": 500,
      "error": "服务器处理时发生错误"
    }
```
```
功能：对指定月份按照类目收支进行排序，默认返回降序
路径：/sortMonthRevenue
方法：GET
参数：
      名称       必填       值          描述
     month       是       1-12         月份
返回结果：
    - 成功：
    {
      "code": 200,
      "data": {
        "list": [
          {
            "type": 1,
            "categoryId": "s73ijpispio",
            "categoryName": "工资",
            "accumulation": "30000.00"
          },
          {
            "type": 0,
            "categoryId": "0fnhbcle6hg",
            "categoryName": "房屋租赁",
            "accumulation": "1500.00"
          },
          {
            "type": 1,
            "categoryId": "5il79e11628",
            "categoryName": "基金投资",
            "accumulation": "1000.00"
          }
        ],
        "income": "31000.00",
        "expend": "1500.00"
      }
    }
    - 失败：
    {
      "code": 400,
      "error": "月份参数不合法"
    }
```


## Todo
- 分页
- 时区问题
- 身份系统
- 账单分类可选（?？有必要）

​​
## 参考文档
[Download Redis](https://redis.io/download)

[Node-Redis document](https://github.com/NodeRedis/node-redis)

[Try Redis](http://try.redis.io/)

[Redis Management GUI for Mac](http://getmedis.com/)

[Koa](https://koa.bootcss.com/)

[axois](https://www.npmjs.com/package/axios)
