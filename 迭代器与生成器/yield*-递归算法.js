function* recursiveGenerator(n) {
  console.log("当前的n:", n);
  if (n > 0) {
    yield* recursiveGenerator(n - 1); // 当 n - 1 为 0 时，这行值为 undefined 所以什么都不做，直接执行下一行
    console.log("-----");
    yield n - 1;
    console.log("继续执行");
  }
  console.log("函数执行完毕的:", n);
}
// for (const value of recursiveGenerator(3)) {
//   console.log(value);
// }

const generator = recursiveGenerator(3);
console.log("第一次调用next");
console.log(generator.next());

console.log("第二次调用next");
console.log(generator.next());

console.log("第三次调用next");
console.log(generator.next());

console.log("第四次调用next");
console.log(generator.next());
