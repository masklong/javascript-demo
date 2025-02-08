// 创建 Map
const map1 = new Map();

const map2 = new Map([
  ["name", "张三"],
  ["age", 18],
]);

// 获取 Map 的长度 size
console.log(map1.size); // 0

// 添加元素 set(key, value)
map1.set("name", "李四");
map1.set("age", 20);

// 获取元素 get(key)
console.log(map1.get("name")); // 李四

// 删除元素 delete(key)
map1.delete("name");

// 判断是否存在 has(key)
console.log(map1.has("name")); // false

// 清空 clear()
map1.clear();

// 遍历
map2.forEach((value, key) => {
  console.log(key, value);
});

// 遍历键
for (const key of map2.keys()) {
  console.log(key);
}

// 遍历值
for (const value of map2.values()) {
  console.log(value);
}

// 遍历键值对
map2.forEach((value, key) => {
  console.log(key, value);
});

// 遍历键值对
for (const [key, value] of map2.entries()) {
  console.log(key, value);
}
