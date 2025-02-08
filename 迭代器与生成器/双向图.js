class Node {
  constructor(id) {
    this.id = id;
    this.neighbors = new Set();
  }
  connect(node) {
    if (node !== this) {
      this.neighbors.add(node);
      node.neighbors.add(this);
    }
  }
}
class RandomGraph {
  constructor(size) {
    this.nodes = new Set();
    // 创建节点
    for (let i = 0; i < size; ++i) {
      this.nodes.add(new Node(i));
    }
    // 随机连接节点
    const threshold = 1 / size;
    for (const x of this.nodes) {
      for (const y of this.nodes) {
        if (Math.random() < threshold) {
          x.connect(y);
        }
      }
    }
  }
  // 这个方法仅用于调试
  print() {
    for (const node of this.nodes) {
      const ids = [...node.neighbors].map((n) => n.id).join(", ");
      console.log(`${node.id}: ${ids}`);
    }
  }

  isConnected() {
    const visitedNode = new Set();
    function* traverse(nodes) {
      for (const node of nodes) {
        if (!visitedNode.has(node)) {
          yield node;
          yield* traverse(node.neighbors);
        }
      }
    }
    // 获取集合中的第一个节点
    const firstNode = this.nodes[Symbol.iterator]().next().value;
    // 使用递归生成器迭代每个节点
    for (const node of traverse([firstNode])) {
      visitedNode.add(node);
    }
    return visitedNode.size === this.nodes.size;
  }
}
const g = new RandomGraph(6);
g.print();
const isConnected = g.isConnected();
console.log("isConnected: ", isConnected);
// 示例输出：
// 0: 2,3,5
// 1: 2,3,4,5
// 2: 1,3
// 3: 0,1,2,4
// 4: 2,3
// 5: 0,4
