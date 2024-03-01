/**
 * 1. createElement
 * 2. render
 * 3. concurrent mode
 * 4. fibers
 * 5. render and commit phases
 * 6. reconciliation
 * 7. Function components
 * 8. hooks
*/

/**/
// import React from 'react'
// import ReactDOM from 'react-dom'

// // const element = <h1 title='foo'>hello</h1>
// // const element = React.createElement('h1', { title: 'foo' }, 'hello')
// const element = {
//     type: 'h1',
//     props: {
//         title: 'foo',
//         children: 'Hello'
//     }
// }
// const node = document.createElement(element.type)
// node['title'] = element.props.title
// const text = document.createTextNode('')
// text['nodeValue'] = element.props.children
// node.appendChild(text)

// const container = document.querySelector('#root')
// // ReactDOM.render(element, container)
// container.appendChild(node)
/**/

import React from 'react'
import ReactDOM from 'react-dom'

const Didact = {
    createElement,
    render
}

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null

// const element = (
//     <div id="foo">
//         <a>bar</a>
//         <b />
//     </div>
// )
const element = Didact.createElement(
    'div',
    { id: 'foo' },
    Didact.createElement('a', {}, 'bar'),
    Didact.createElement('b')
)
const container = document.querySelector('#root')
Didact.render(element, container)

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    nextUnitOfWork = wipRoot
}

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
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
    reconcileChildren(fiber, elements)

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

function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
    const isProperty = key => key !== 'children'
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })
    return dom
}

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

function reconcileChildren(wipFiber, elements) {
    let index = 0
    let prevSibling = null
    while (index < elements.length) {
        const element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            parent: wipFiber
        }
        if (index === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }
}