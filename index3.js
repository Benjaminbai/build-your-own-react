
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

function commitRoot() {
    commitWork(wipRoot.child)
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
    let index = 0
    let prevSibling = null
    while (index < elememnts.length) {
        const element = elememnts[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }
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
        }
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