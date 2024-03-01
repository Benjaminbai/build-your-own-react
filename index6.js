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
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)
    const isProperty = key => key !== 'children'
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })
    element.props.children.forEach(child => {
        render(child, dom)
    });
    container.appendChild(dom)
}

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {

}