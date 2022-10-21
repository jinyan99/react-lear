# react-learn

学习react源码,  先从读代码开始，从react17.0源码细读

> [导学](https://www.bilibili.com/video/BV1Ki4y1u7Vr/?vd_source=dabdcdd419ed3bc022bc41c4fd99a0be)

1. [参考链接](https://react.iamkasong.com/#%E7%AB%A0%E8%8A%82%E5%88%97%E8%A1%A8)
2. 个人xmind笔记(wps)
3. [build-your-own-react，构建迷你react，仅几百行代码](https://pomb.us/build-your-own-react/)

## react17学习

直接在react源码中标注研究即可

```js
// fiber 数据结构，了解了他，react基本上也懂差不多了
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 作为静态数据结构的属性
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性
  this.pendingProps = pendingProps; // 等待更新的props
  this.memoizedProps = null; // 计算好的最终props新值

  // class组件宿主组件存储 updates 的地方，是以queue为类型保存的
  this.updateQueue: queue = null; // 1. 先存放completeWork阶段的updatePayload数组  2. 再存放该节点要更新的Update链表的queue链表即下文的 queue 值

  // 函数组件存储 updates 的地方，是以hook为类型保存的
  this.memoizedState: hook = null; // FunctionComponent对应fiber保存的Hooks链表 即下文的 hook 结构组成的链表

  this.dependencies = null;

  this.mode = mode;

  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}

const hook = {
  // 保存update的queue，即上文介绍的queue
  queue: {
    pending: null// pending连接的就是环状单向update组成的链表。为什么环状方便遍历
  },
  // 保存hook对应的state或effects链表
  memoizedState: initialState,
  // 与下一个Hook连接形成单向无环链表
  next: null
}

// 类组件宿主组件的存储更新对象的属性
const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      // 保存update的链表
      pending: null,
    },
    effects: null,
  };
```

## react16版本对比

## react18对比
