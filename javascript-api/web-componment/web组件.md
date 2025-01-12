## 介绍

在 web 组件之前，一直缺少基于 HTML 解析构建 DOM 子树，然后再需要时再把这个子树渲染出来的机制。之前有两种方案：

1. 使用`innerHTML`把标记字符串 转换为 DOM 元素，这种方式存在严重的安全隐患；
2. 使用`document.createElement()`构建每个元素，然后逐步添加到孤儿根节点（不是添加到 DOM），然后再将[孤儿根节点](#t7Lgq)添加到 DOM 中，这样特别麻烦，完全与标记无关。

## HTML 模版

### 使用 DocumentFragment

```html
<template id="foo">
  <p>I'm inside a template!</p>
</template>
```

在浏览器中渲染时，`<template>`标签内的内容不会被渲染到页面上，因为其不属于活动文档。所以`document.querySelector()`等 DOM 查询方法不会发现其中的`p`标签。因为`p`标签存在 于 一个包含在 HTML 模版中的`DocumentFragment`节点内。

通过` <template>`元素的`content`属性可以取得这个`DocumentFragment`的引用：

```javascript
const fragment = document.querySelector('#foo').content
console.log(fragment) // #document-fragment
console.log(document.querySelector('p')) // null
console.log(fragment.querySelector('p')) //<p>...<p>
```

使用`DocumentFragment`可以一次性添加所有子节点，最多只会有一次布局重排。注意：转移之后`DocumentFragment`清空，`template`同理。

```javascript
// 开始状态：
// <div id="foo"></div>
//
// 期待的最终状态：
// <div id="foo">
//    <p></p>
//    <p></p>
//    <p></p>
// </div>
// 也可以使用document.createDocumentFragment()
const fragment = new DocumentFragment()
const foo = document.querySelector('#foo')
// 为DocumentFragment添加子元素不会导致布局重排
fragment.appendChild(document.createElement('p'))
fragment.appendChild(document.createElement('p'))
fragment.appendChild(document.createElement('p'))
console.log(fragment.children.length) // 3
foo.appendChild(fragment)
// 注意：转移之后 fragment 变空了
console.log(fragment.children.length) //0
console.log(document.body.innerHTML)
// <div id="foo">
//    <p></p>
//    <p></p>
//    <p></p>
// </div>
```

### 使用`<template>`标签

除了使用`DocumentFragment`类创建外，还可以现在 HTML 上声明`<template>`标签，然后通过 js 获取到其内容：

```javascript
const fooElement = document.querySelector('#foo')
const barTemplate = document.querySelector('#bar')
const barFragment = barTemplate.content
console.log(document.body.innerHTML)
// <div id="foo">
// </div>
// <template id="bar">
//   <p></p>
//   <p></p>
//   <p></p>
// </template>
fooElement.appendChild(barFragment)
console.log(document.body.innerHTML)
// <div id="foo">
//   <p></p>
//   <p></p>
//   <p></p>
// </div>
// <tempate id="bar"></template>
```

如果只想复制`template`，可以使用`document.importNode()`方法克隆：

```javascript
fooElement.appendChild(document.importNode(barFragment, true))
```

### 模版脚本

`<template>`中的脚本在`<template>`中的内容被实际添加到 DOM 树时才会执行（换言：脚本执行可以推迟到将 DocumentFragment 的内容实际添加到 DOM 树）

```javascript
// 页面HTML：
//
// <div id="foo"></div>
// <template id="bar">
//    <script>console.log('Templatescriptexecuted');</script>
// </template>
const fooElement = document.querySelector('#foo')
const barTemplate = document.querySelector('#bar')
const barFragment = barTemplate.content
console.log('About to add template')
fooElement.appendChild(barFragment) // 被添加到DOM树时脚本才会执行
console.log('Added template')
// About to add template
//Templatescriptexecuted
// Added template
```

## 影子 DOM

它允许开发者为自定义元素创建一个封闭的 DOM 树。影子 DOM 是一个 DOM 子树，它与文档的主 DOM 树完全隔离，这样可以防止样式和事件的污染和冲突。

特点：

- 创建一个完全封闭的子树
- 可以隔离样式，避免外部样式影响内部样式
- 可以使自定义元素的内部结构和样式对外部代码不可见

影子 DOM 是通过`attachShadow()`方法创建并添加给有效 HTML 元素的。容纳影子 DOM 的元素被称为影子宿主（shadow host）。影子 DOM 的根节点被称为影子根（shadow root）。

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>shadowDom</title>
  </head>
  <body></body>
  <script>
    for (let color of ['red', 'green', 'blue']) {
      const div = document.createElement('div')
      // div 是影子宿主，shadowDOM是影子根
      const shadowDOM = div.attachShadow({ mode: 'open' })
      document.body.appendChild(div)
      shadowDOM.innerHTML = `
      <p>Make me ${color}</p>
      <style>
      p {
        color: ${color};
      }
      </style>
    `
    }
    function countP(node) {
      console.log(node.querySelectorAll('p').length)
    }
    countP(document) //0
    for (let element of document.querySelectorAll('div')) {
      // 影子根
      countP(element.shadowRoot)
    }
    //1
    //1
    //1
  </script>
</html>

```

- 影子 DOM 模式：开发与封闭

**开放模式(Open Shadow DOM)**：影子 DOM 对外部 js 可见，通过`shadowRoot`访问影子 DOM；

可以从外部修改影子 DOM 内容：

```javascript
// const shadowRoot = element.shadowRoot; // 获取影子DOM并进行修改
// 例如上例中的：
for (let element of document.querySelectorAll('div')) {
  countP(element.shadowRoot) // 获取影子DOM
}
```

封闭模式(Close Shadow DOM)：影子 DOM 对外部 js 是无法访问的，无法通过`shadowRoot`访问影子 DOM；确保外部无法直接操作影子 DOM 内容，一般使用这种模式的场景很少。

```javascript
const div = document.createElement('div')
const shadowDOM = div.attachShadow({ mode: 'closed' })
console.log(div.shadowRoot) // null
```

### 合成、影子 DOM 槽位

🤔 考虑 1：如果影子宿主中有自己的 DOM，该如何显示？

答：当影子宿主有自己的内部 DOM 元素，在设置影子 DOM 后会隐藏，不展示。原因是当影子 DOM 被添加到元素中时，浏览器就会赋予它最高优先级，优先渲染影子 DOM，而不是原本的内容。

🤔 考虑 2:如何将宿主的 DOM，在影子 DOM 中展示？

答：在影子 DOM 中使用`<slot>`标签，让影子宿主中的文本显示在`<slot>`标签位置。这叫做 DOM 内容的投射(projection)，实际的元素依然处于外部 DOM 中。

```javascript
document.body.innerHTML = `
    <div>
      <p>我是正常的P元素</p>
    </div>
    `
const divElement = document.querySelector('div')
const shadowDOM = divElement.attachShadow({
  mode: 'open',
})
shadowDOM.innerHTML = `
    <p>我是影子DOM中的P元素</p>
    <slot></slot>
    `
// 界面效果：
// 我是影子DOM中的P元素
// 我是正常的P元素

// 这种方式叫做投射，即将父DOM中的元素投射到影子DOM中,slot标签是一个占位符，用于投射父DOM中的元素
// p 元素依旧在父DOM中
console.log(document.querySelectorAll('p').length)
// 1
```

🤔 考虑 3: 宿主的多个内容想放置在影子 DOM 中不同的位置，如何实现？

答：使用 命名槽位(named slot)，不带 `name` 属性的`<slot>叫做默认槽位`

```javascript
document.body.innerHTML = `
<div>
  <p slot='foo'>foo</p>
  <p slot='bar'>bar</p>
</div>
`
const divElement = document.querySelector('div')
const shadowDOM = divElement.attachShadow({
  mode: 'open',
})
shadowDOM.innerHTML = `
<slot name='bar'></slot>
<slot name='foo'></slot>
`
// 渲染效果：bar在上面，foo在下面
```

### 影子 DOM 的事件重定向（Event Retarget）

当一个事件（例如点击事件）在影子 DOM 中的元素上触发时，这个事件会沿着 **事件冒泡链** 向上传播。

**内部事件处理：**当点击影子 DOM 中的按钮时，event.target 指向的是影子 DOM 内部的 <button> 元素。

**外部事件处理：**当事件从影子 DOM 冒泡到外部时，**event.target 会被重定向到宿主元素** <my-element>

```javascript
document.body.innerHTML = `
<div onclick="console.log('Handled outside:',event.target)">
</div>
`
const divElement = document.querySelector('div')
const shadowDOM = divElement.attachShadow({
  mode: 'open',
})
shadowDOM.innerHTML = `
<button onclick="console.log('Handled inside:',event.target)">Click me</button>
`
// 点击按钮时日志输出：
//Handledinside:   <buttononclick="..."></button>
//Handledoutside: <divonclick="..."></div>
// 解析：事件会从影子DOM中的元素冒泡到父DOM中的元素，父DOM的事件被触发
// 事件重定向：父DOM的事件对象的target属性指向的是父DOM中的元素，而不会是影子DOM中的元素
```

⚠️ 注意：事件重定向只会发生在影子 DOM 实际存在的元素上，通过`<slot>`投射进来的元素不会发生重定向。

## 自定义元素

调用全局属性：`customElements`的`define()`方法可以创建自定义元素。`customElements`属性返回`CustomElementRegistry`对象。

### 创建自定义元素

1. 创建一个类继承`HTMLElement`（也可以继承其他元素类，例如继承 HTMLDivElement）
2. 调用`customElements.define(自定义标签名,自定义元素的类)`
3. ⚠️ 注意：元素标签名必须包含短横线；元素标签不能自闭合(不能这样：`<x-foo />`)

```javascript
// 创建一个类，继承HTMLElement
class FooElement extends HTMLElement {}
// 使用customElements.define()方法注册自定义元素
// 第一个参数是元素名称，第二个参数是自定义元素的类
// 元素名称必须包含一个短横线，以便与内置元素区分
customElements.define('x-foo', FooElement)
// 将自定义元素添加到文档中
// 元素标签不能自闭合
document.body.innerHTML = '<x-foo>我是自定义元素</x-foo>'
console.log(document.querySelector('x-foo') instanceof FooElement) // true
```

4. 如果自定义标签是继承某个元素类，可以使用`is`属性和`extends`选项，将该标签指定为该自定义元素的示例

```javascript
class FooElement extends HTMLDivElement {
  constructor() {
    super()
  }
}
// 使用extends选项，和is属性，将该标签指定为该自定义元素的实例
customElements.define('x-foo', FooElement, { extends: 'div' })
document.body.innerHTML = '<div is="x-foo">我是自定义元素</div>'
```

### 给自定义元素添加内容

- 在构造函数中使用影子 DOM

```javascript
class FooElement extends HTMLElement {
  constructor() {
    super()
    // const shadowDOM = this.attachShadow({ mode: 'open' })
    // shadowDOM.innerHTML = `
    // <div>
    //   <p>这是通过影子DOM给自定义元素添加的内容</p>
    // </div>
    // `
    // 更简便的方式：
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
    <div>
      <p>这是通过影子DOM给自定义元素添加的内容</p>
    </div>
    `
  }
}
customElements.define('s-foo', FooElement)
document.body.innerHTML = `
<s-foo></s-foo>
`
```

- 使用`<template>`(HTML 模版)

```html
<body>
  <template id="x-foo-template">
    <p>这是template的内容，添加到自定义元素内部</p>
  </template>
</body>
<script>
  const template = document.querySelector('#x-foo-template')
  class FooElement extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      this.shadowRoot.appendChild(template.content.cloneNode(true))
    }
  }
  customElements.define('s-foo', FooElement)
  document.body.innerHTML += `<s-foo></s-foo>`
</script>
```

### 自定义元素声明周期

自定义元素有 5 个声明周期方法：

- `constructor()`：在创建元素实例或将已有 DOM 元素升级为自定义元素时调用。
- `connectedCallback()`：在每次将这个自定义元素实例添加到 DOM 中时调用
- `disconnectedCallback()`：在每次将这个自定义元素实例从 DOM 中移除时调用
- `attributeChangedCallback()`：在每次可观察属性的值发生变化时调用。在元素实例初始化时，初始值的定义也算一次变化
- `adoptedCallback()`：在通过`document.adoptNode()`将这个自定义元素实例移动到新文档对象时调用

```javascript
class FooElement extends HTMLElement {
  constructor() {
    super()
    console.log('constructor')
  }
  connectedCallback() {
    console.log('connectedCallback')
  }
  disconnectedCallback() {
    console.log('disconnectedCallback')
  }
}
customElements.define('x-foo', FooElement)
const fooElement = document.createElement('x-foo')
document.body.appendChild(fooElement)
document.body.removeChild(fooElement)
//constructor
//connectedCallback
//disconectedCallback
```

### 反射自定义元素属性

自定义元素既是 DOM 实体又是 JS 对象，因此两者之间应该同步变化。即对 DOM 的修改应该反应到 JS 对象，反之亦然。

- 从 JS 对象反射到 DOM，使用获取和设置函数：

```javascript
document.body.innerHTML = `<x-foo></x-foo>`
class FooElement extends HTMLElement {
  constructor() {
    super()
    this.bar = true
  }
  get bar() {
    return this.getAttribute('bar')
  }
  set bar(value) {
    this.setAttribute('bar', value)
  }
}
customElements.define('x-foo', FooElement)
console.log(document.body.innerHTML)
//<x-foo bar="true">
```

- 从 DOM 反射到 js 对象

```javascript
class FooElement extends HTMLElement {
  static get observedAttributes() {
    return ['bar']
  }
  constructor() {
    super()
  }
  get bar() {
    return this.getAttribute('bar')
  }
  set bar(value) {
    this.setAttribute('bar', value)
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      console.log(`${oldValue}->${newValue}`)
      this[name] = newValue
      // this.setAttribute(name,newValue)
    }
  }
}
customElements.define('x-foo', FooElement)
document.body.innerHTML = `
<x-foo bar='false'></x-foo>
`
//null->false
document.querySelector('x-foo').setAttribute('bar', true)
//false->true
```

### 其他 API

- `get()`方法：返回自定义元素的类
- `whenDefined()`：返回一个期约，当自定义元素有定义之后解决

```javascript
customElements.whenDefined('x-foo').then(() => {
  console.log('defined!')
})
console.log(customElements.get('x-foo'))
// undefiend
customElements.define('x-foo', class {})
console.log(customElements.get('x-foo'))
//class FooElement{}
```

- `upgrade()`方法：如果想在元素连接到 DOM 之前强制升级，可以使用`upgrade()`

```javascript
// 在自定义元素有定义之前会创建 HTMLUnknowElement对象，
// fooElement 是HTMLUnknowElement对象
const fooElement = document.createElement('x-foo')
// 创建自定义元素
class FooElement extends HTMLElement {}
customElements.define('x-foo', FooElement)
console.log(fooElement instanceof FooElement)
//日志输出：false
// 强制升级
customElments.upgrade(fooElement)
console.log(fooElement instanceof FooElement)
// 日志输出：true
```

## 附录：

#### 孤儿根节点：

“孤儿根节点”（Orphan Root Node）这个概念在 Web 开发中并不是一个标准术语，但它通常用来描述某个节点（尤其是 DOM 元素）在创建时并没有被附加到实际的 DOM 树中，而是存在一个单独的临时父节点或孤立节点，直到你明确地将它附加到 DOM 树中。这种做法一般是为了在正式插入 DOM 之前准备或构建元素，常见于动态渲染内容的场景中。

示例：假设你要创建一个列表项，并且先将它插入到一个孤立的根节点中，等到所有列表项都准备好后再将它们一次性插入到页面中

```javascript
// 创建一个新的 div 作为“孤儿根节点”
const orphanRoot = document.createElement('div')

// 创建一些动态元素并附加到“孤儿根节点”
const item1 = document.createElement('div')
item1.textContent = 'Item 1'
orphanRoot.appendChild(item1)

const item2 = document.createElement('div')
item2.textContent = 'Item 2'
orphanRoot.appendChild(item2)

// 现在，你可以在适当的时候把整个“孤儿根节点”插入到 DOM 中
document.body.appendChild(orphanRoot)
```
