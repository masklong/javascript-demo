function* generatorFn() {
  console.log('开始执行')
  yield 'Hello world'
  console.log('执行完毕')
}
const generatorFn1 = function* () {}

const generatorObject = generatorFn()

console.log('第一次调用next()')
let value = generatorObject.next()
console.log('value: ', value)
console.log('第二次调用next()，继续执行生成器函数的内容')
value = generatorObject.next()
console.log('value: ', value)
