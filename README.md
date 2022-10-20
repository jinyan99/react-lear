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
  this.updateQueue = null; // 存放该节点要更新的Update链表的queue链表
  this.memoizedState = null; // 产生更新时Update对象经过链表计算后的最终新的的state存放在这里
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
```

## react16版本对比

## react18对比
