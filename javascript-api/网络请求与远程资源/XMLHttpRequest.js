// 创建 XMLHttpRequest 实例
const xhr = new XMLHttpRequest();

// 当响应完成接收后立即触发，也可以使用 onreadystatechange 事件处理程序
xhr.onload = (event) => {
  try {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      const res = xhr.responseText;
      console.log("响应结果", res);
    } else {
      console.error("出错了");
    }
  } catch (e) {
    // 假设由 ontimeout 处理
  }
};

// 进度处理,event 包含三个属性：length
xhr.onprogress = (event) => {
  if (event.lengthComputable) {
    console.log(`当前进度：${event.position}/${event.totalSize}`);
  }
};

/**
 * open 接收三个参数：请求方式、服务器地址、是否异步请求（js是否等待服务器响应之后再继续执行）
 * url 如果含有特殊字符，需要通过 encodeURIComponent 编码
 */
xhr.open("GET", `/api/getUser?name=${encodeURIComponent("value")}`, true);

// 如果要设置请求头，在 open 之后，send 之前
xhr.setRequestHeader("MyHeader", "MyValue");

/**
 * 设置超时时间,超时后会触发 ontimeout 事件，且会中断请求
 * xhr.readyState仍然会变成4，因此也会调用onreadystatechange事件处理程序。
 * 如果在超时之后访问status属性则会发生错误。为做好防护，
 * 可以把检查status属性的代码封装在try/catch语句中
 */
xhr.timeout = 30000;

xhr.ontimeout = () => {
  console.log("请求超时");
};

// 修改响应的MIME类型，必须在调用send()之前调用overrideMimeType()
xhr.overrideMimeType("text/xml");

/**
 * 如果不需要发送数据，则传 null
 * 如果传送数据，可创建 FormData 数据，即HTML表单数据:
 * const formData = new FormData()
 * formData.append('name','value')
 * xhr.send(formData)
 */
xhr.send(null);

// 可以使用 abort() 方法取消异步请求
xhr.abort();
