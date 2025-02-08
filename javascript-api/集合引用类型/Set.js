const set = new Set();

// 添加元素
set.add(1);

set.add(2);

console.log(set.keys === set[Symbol.iterator]); // true
console.log(set.values === set[Symbol.iterator]); // true

// 遍历
for (const pair of set.entries()) {
  console.log(pair);
}
// [1, 1]
// [2, 2]
