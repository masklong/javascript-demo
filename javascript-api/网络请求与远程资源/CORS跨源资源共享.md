****

**同源策略：**它是浏览器中一个安全机制，只允许网页访问其同源的资源，防止不同源的网页之间的恶意操作。同源的定义：两个 URL 如果具有相同的协议、域名和端口号，则是同源。



但实际情况是有些情况需要跨源访问资源，**跨源资源共享（CORS, Cross-Origin Resource Sharing）**定义了浏览器与服务器如何实现跨源资源通信。其背后的**基本思路是使用自定义 HTTP 头部让浏览器和服务器相互了解**，以确定请求或响应应该成功还是失败。



## CORS 的工作原理
CORS 是浏览器通过发送特定的 HTTP 请求头和响应头来实现跨资源共享的机制，通过这些头信息，浏览器和服务器可以协商是否允许跨资源请求。

关键头信息：

1. **请求头：**

浏览器发送请求时，会附带一些请求头：

+ `Origin`: 发起请求的源（协议、域名、端口）
+ `Access-Control-Request-Method`: 用于预检请求，表示请求使用的方法（如 POST）
+ `Access-Control-Request-Headers`: 用于预检请求，表示请求中将使用的自定义头部
2. **响应头：**
+ `Access-Control-Allow-Origin`: 允许哪些源可以访问资源，如果`*`表示允许所有的源访问
+ **Access-Control-Allow-Methods:** 允许哪些 HTTP 方法进行跨源请求
+ **Access-Control-Allow-Header:** 指定允许的自定义请求头部

```html
Access-Control-Allow-Headers: Content-Type, X-Custom-Header
```

+ **Access-Control-Allow-Credentials: **是否允许浏览器发送 Cookie 或 HTTP 认证信息
+ **Access-Control-Expose-Headers:** 告诉浏览器哪些响应头可以暴露给 js 代码
+ **Access-Control-Max-Age: **指定预检请求的有效时间



## CORS 请求主要分三种类型：
### 简单请求
要求：

+ 使用的 HTTP 方法是 GET、POST、HEAD
+ 请求头不包含自定义头部
+ Content-Type 只允许以下三种值：**text/pain**、**application/x-www-form-urlencoded**、**mutipart/form-data**

### 预检请求
预检请求是浏览器在发送复杂请求之前发送的一种 OPTIONS 请求，用于询问服务器是否允许该请求。

复杂请求的条件：

+ 请求方法是：`PUT`、`DELETE` 等
+ 请求包含自定义的头部、或 `Content-Type` 不在简单请求范围内

```javascript
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({ key: 'value' })
});

```

在发送上面真是请求之前，浏览器会先发送一个 OPTIONS 请求：

```http
OPTIONS /data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, X-Custom-Header
```

如果服务器响应允许该请求，则浏览器会继续发送实际请求



### 跨域请求携带认证信息
默认情况下，浏览器不会在跨域请求中发送认证信息（如 Cookies 或 HTTP 认证信息）。但是，如果需要发送这些信息，必须在请求和响应中都设置特定的头部。

1. 请求头设置：

```javascript
fetch('http://xxx/data',{
  method:'GET',
  credentials:'includ' // 发送 Cookies 或认证信息
})
```

2. 响应头设置：`Access-Control-Allow-Credentials:true`
3. 同时，`Access-Control-Allow-Origin` 不能是`*`，必须是具体的源



