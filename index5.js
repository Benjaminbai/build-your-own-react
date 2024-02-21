///////////////////////////////////////////////////
// const element = <h1 title="foo">hello world</h1>
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// const element = React.createElement(
//     "h1",
//     {
//         title: "foo"
//     },
//     "hello world"
// )
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// const element = {
//     type: "h1",
//     props: {
//         title: "foo",
//         children: "hello world"
//     }
// }
///////////////////////////////////////////////////
// const container = document.querySelector("#root")

///////////////////////////////////////////////////
// ReactDOM.render(element, container)
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// const node = document.createElement(element.type)
// node["title"] = element.props.title
// const text = document.createTextNode("")
// text["nodeValue"] = element.props.children
// node.appendChild(text)
// container.appendChild(node)
///////////////////////////////////////////////////

///////////////////////////////////////////////////
// const element = (
//     <div id="foo">
//         <a>bar</a>
//         <b />
//     </div>
// )
///////////////////////////////////////////////////

///////////////////////////////////////////////////
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === "object" ? child : createTextElement(child))
        }
    }
}

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type)
    const isProperty = key => key !== "children"
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })
    return dom
}

function render(element, container) {
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element]
        }
    }
}

///////////////////////////////////////////////////
let nextUnitOfWork = null
function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null
    while (index < elements.length) {
        const element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            parent: fiber
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
///////////////////////////////////////////////////

const Didact = {
    createElement,
    render
}

// const element = Didact.createElement(
//     "div",
//     { id: "foo" },
//     React.createElement("a", null, "bar"),
//     React.createElement("b")
// )

/* @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)

const container = document.querySelector("#root")
// ReactDOM.render(element, container)
Didact.render(element, container)
///////////////////////////////////////////////////