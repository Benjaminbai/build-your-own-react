
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
let deletions = []

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function updateDom(dom, prevProps, nextProps) {
    
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom

    if(fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom)
    }else if(fiber.effectTag === 'DELETION') {
        domParent.removeChild(fiber.dom)
    }else if(fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    }
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
            newFilber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }
        if (oldFiber && !sameType) {
            // TODO delete the oldFiber's node
            oldFiber.effectTag = 'DELETION'
            deletions.push(oldFiber)
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
    deletions = []
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