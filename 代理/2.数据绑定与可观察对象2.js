/**
 * 把集合绑定到一个事件分派程序，每次插入新实例时都会发送消息
 */

const userList = [];

const emit = (property, newValue) => {
  // 收到消息，处理消息
  console.log(`这是${property}新值：${newValue}`);
};

const proxy = new Proxy(userList, {
  set(target, property, value, receiver) {
    const res = Reflect.set(...arguments);
    if (res) {
      // 设置新元素成功
      emit(property, Reflect.get(target, property, receiver));
    }
    return res;
  },
});

proxy.push("Bor");
proxy.push("Foo");
// Bor
// 1
// Foo
// 2
// 因为push 完数组后，需要设置 proxy 的length，因此又触发了 set 捕获器

/**
 * 优化：仅针对元素添加、修改才进行通知
 */

const proxy1 = new Proxy(userList, {
  set(target, property, value, receiver) {
    // 忽略length
    if (property === "length") {
      return Reflect.set(...arguments);
    }

    // 检查属性是否为有效的数组索引
    const isIndex =
      typeof property === "string" &&
      /^(0|[1-9]\d*)$/.test(property) &&
      Number(property) <= 4294967294; // 最大有效索引（2^32 - 2）
    // 是数组索引时：
    if (isIndex) {
      const res = Reflect.set(...arguments);
      if (res) {
        emit(property, value);
      }
      return res;
    }

    // 非索引属性直接设置（如普通对象属性）
    return Reflect.set(...arguments);
  },
});

proxy1.push("新proxy");
proxy1[1] = "new bar";
