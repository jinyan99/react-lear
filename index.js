// 模拟React大对象
const MyReact = {
  createElement,
  render,
};

/**
 * 1. 创建createElement函数
 * @param {*} type
 * @param {*} props
 * @param  {...any} children
 * @returns
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * 2. render
 * @param {*} element
 * @param {*} container
 */
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });
  element.props.children.forEach((child) => render(child, dom));
  container.appendChild(dom);
}

/**
 * 4. 为了组件工作单元，我们需要将上面render里的element数据结构改变为一个新的数据结构：fiber树结构（链表型siblingreturnchild...）
 *  4-1、每一个元素都是fibr节点，每个fiber节点都对应一个工作单元
 *
 *  4-2. 在渲染中，我们将从根节点开始创建根光纤，并将其设置为初始nextUnitOfWork。剩下的工作将发生在performUnitOfWork函数上，在那里我们将为每个光纤做三件事:
 *      a、将元素添加到DOM中
        b、为元素的子元素创建fiber节点
        c、返回下一个工作单元
    4-3. 这种数据结构的目标之一是使查找下一个工作单元变得容易。这就是为什么每根纤维都与它的第一个孩子、下一个兄弟姐妹和它的父母有联系

    4-4. 接下来我们用工作单元重构render函数
 */
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

/**
 * 重构为异步可中断的 render，执行此函数就是设置全局变量 nextUnitOfWork 的执行初始值
 * @param {*} element
 * @param {*} container
 * 在渲染函数中，我们将nextUnitOfWork设置为fiber树的根
 */
function concurrentRender(element, container) {
  // TODO set next unit of work
  // 赋值fiber树的链表头部fiber即根节点，暂时将fiber结构简写为包含dom和props两个属性
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

/** 每个工作单元存放的就是fiber节点结构-链表 */
let nextUnitOfWork = null;
/** 新增内存中正在进行的工作根节点fiber树 */
let wipRoot = null;

function workLoop(deadline) {
  // 实现异步可中断递归
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 一旦我们完成了所有的工作(我们知道这一点，因为没有下一个工作单元)，我们就将整个fiber树提交给专门的批量DOM操作方法-----即不让他在performUnitOfWork中串行的操作dom了。
  if (!nextUnitOfWork && wipRoot) {
    // 将根fiber树交给dom操作方法
    commitRoot()
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

/**
 * 实现异步中断渲染的最核心的方法---代替上面的render
 * 目的：就是将你写的组件里的虚拟dom更高效的挂载到页面dom容器中
 * 主要做3件事：
 *  1. 添加dom节点
 *  2. 创建fiber节点
 *  3. 返回下一个工作单元（孩子兄弟叔叔的顺序）
 */
function performUnitOfWork(fiber) {
  // 1- TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 为了后面在提交阶段批量更新dom提高性能：这块需要删掉操作dom的部分
//   if (fiber.parent) {
//     fiber.parent.dom.appendChild(fiber.dom);
//   }
  // 2- TODO create new fibers
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    // 创建fiber节点 --- 【核心】
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // 我们把它添加到纤维树中设置它是子结点还是兄弟结点，取决于它是不是第一个子结点。
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
  // 3- 返回下一个工作单元
  // 我们先尝试孩子，然后是兄弟姐妹，然后是叔叔
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

/**
 * 5. 创建Render与Commit两大阶段
 *    5-1: 解决目前问题：上面performUnitOfWork方法每次处理一个元素时，我们都会向DOM添加一个新节点。而且，请记住，浏览器可能会在我们完成渲染整个树
 *         之前中断我们的工作。在这种情况下，用户将看到一个不完整的UI。我们不希望这样。
 *    5-2: 我们需要从performUnitOfWork里删除改变DOM的部分。需要重构下改变dom的部分
 */
function concurrentRender2(element, container) {
  // 先改名wipRoot：正在进行的工作根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

/**
 * 创建commitRoot方法
 * 目的：我们在commitRoot函数中执行。这里我们递归地将所有节点附加到dom。
 */
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}





















// ================= END： 使用react渲染组件到页面上 =================================================================
