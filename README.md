# react-learn

学习react源码,  先从读代码开始，从react17.0源码细读

> 参考 [build-your-own-react，构建迷你react，仅几百行代码](https://pomb.us/build-your-own-react/)
> [参考github源码](https://github.com/chinanf-boy/didact)

## 百行代码构建mini-react

### 1. 创建createElement方法

### 2. 创建render方法

### 3. 实现Concurrent Mode

```javascript
/**
 * 3. 实现并发模式 Concurrent Mode
 *   3.1 上面的render里的递归实现问题：一旦我们开始渲染，我们就不会停止，直到我们渲染了完整的元素树。如果元素树很大，
 *       它可能会阻塞主线程太长时间。如果浏览器需要做一些高优先级的事情，比如处理用户输入或保持动画流畅，它将不得不等待渲染完成
 *   因此，我们需要将把工作分解成小单元，在我们完成每个单元后，如果还有其他需要完成的工作，我们将让浏览器中断渲染。
 */
let nextUnitOfWork = null;
function workLoop(deadline) {
  // deadline参数：我们可以使用它来检查在浏览器需要再次控制之前还有多少时间
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 判断浏览器有没有空闲时间，若小于1ms，我们认为应该阻断当前渲染，及时让权浏览器渲染绘制
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 我们使用requestIdleCallback来进行循环。您可以将requestIdleCallback看作一个setTimeout，
  // 但是不是我们告诉它什么时候运行，而是浏览器在主线程空闲时运行回调。
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

### 4. 实现Fiber架构

### 5. 实现 Render(协调器) 与Commit(渲染器) 两大核心阶段

### 6. 实现diff算法 - Reconcilation

### 7. 实现函数式组件化

### 8. 实现 Hooks 能力
