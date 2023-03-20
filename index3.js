
// const element = {
//     type: 'h1',
//     props: {
//         title: 'foo',
//         children: 'hello'
//     }
// }

// const container = document.getElementById('root')

// const node = document.createElement(element.type)
// node['title'] = element.props.title

// const text = document.createTextNode("")
// text['nodeValue'] = element.props.children

// node.appendChild(text)
// container.appendChild(node)

let nextUnitOfwork = null
let wipRoot = null
let currentRoot = null

function commitRoot() {
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfwork && shouldYield) {
        nextUnitOfwork = performUnitOfWork(nextUnitOfwork)
        shouldYield = deadline.timeRemaining() < 1

    }

    if (!nextUnitOfwork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    const elememnts = fiber.parent.children
    reconcileChildren(fiber, elememnts)

    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function reconcileChildren(wipFiber, elememnts) {
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while (index < elememnts.length || oldFiber != null) {
        const element = elememnts[index]
        let newFilber = null

        const sameType = oldFiber && element && element.type === oldFiber.type
        if (sameType) {
            // TODO update the node
            newFilber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE"
            }
        }
        if (element && !sameType) {
            // TODO add this node
        }
        if (oldFiber && !sameType) {
            // TODO delete the oldFiber's node
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object"
                    ? child
                    : createTextElement(child)
            ),
        }
    }
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ?
        document.createTextNode('')
        :
        document.createElement(fiber.type)

    const isProperty = key => key !== 'children'
    Object.keys(fiber.props).filter(isProperty).forEach(name => {
        dom[name] = fiber.props[name]
    })
    return dom
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    nextUnitOfwork = wipRoot
}

const Didact = {
    createElement,
    render
}

/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)

const container = document.getElementById("root")
Didact.render(element, container)