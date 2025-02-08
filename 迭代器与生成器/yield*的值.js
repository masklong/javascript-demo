// yield* 的值是关联迭代器返回 done 为 true 时的 value的值，即 undefined
function* generatorFn() {
  const iterValue = yield* [1, 2];
  console.log("iterator value:", iterValue);
}

for (const value of generatorFn()) {
  console.log("value:", value);
}

// 对于 生成器函数产生的迭代器来说，这个值就是生成器函数返回的值
function* generatorFn2() {
  yield "a";
  return "b";
}

function* generatorFn3() {
  const value = yield* generatorFn2();
  console.log("当生成器函数产生的迭代器时，yield* 的值:", value);
}

for (const value of generatorFn3()) {
  console.log("extra value:", value);
}
