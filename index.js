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
 * 4. 为了组件工作单元，我们需要一个数据结构：fiber树
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

// 重构为异步可中断的render
function concurrentRender(element, container) {
  // TODO set next unit of work
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

let nextUnitOfWork = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 1- TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  // 2- TODO create new fibers
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

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
  // 3- TODO return next unit of work
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

// ================= END： 使用react渲染组件到页面上 =================================================================
