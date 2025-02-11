/**
 * 将被代理的类绑定到一个全局实例集合，所有创建的实例都被添加到这个集合上
 */

const personList = [];
class Person {
  constructor(name) {
    this.name = name;
  }
}

const PersonProxy = new Proxy(Person, {
  construct(target, argArray, newTarget) {
    const person = Reflect.construct(...arguments);
    personList.push(person);
    return person;
  },
});

const person1 = new PersonProxy("Li");
const person2 = new PersonProxy("Wen");
console.log(personList);
