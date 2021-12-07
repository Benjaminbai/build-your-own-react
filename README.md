# build-your-own-react

[build-your-own-react 原文](https://pomb.us/build-your-own-react/)

## 步骤
### Step 0: The vanilla javascript
  1. 将jsx语法模拟成对象结构，包含type，props等属性
  2. 通过type创建真实dom节点，通过props为节点添加属性
  3. 字符串或文本也单独声明一个文本节点
  4. 挂载到dom

### Step I: The createElement Function
  1. jsx语法会被编译成React.createElement(type, props, ...children)的形式
  2. 编写createElement函数，文本类型单独处理成对象结构
  3. /** @jsx Didact.createElement */告诉babel如何编译

### Step II: The render Function
  1. 编写render函数，render接收element，container两个参数
  2. 判断节点类型，分别处理
  3. 遍历追加节点属性
  4. 递归调用render
  5. 挂载到dom树

### Step III: Concurrent Mode
### Step IV: Fibers
### Step V: Render and Commit Phases
### Step VI: Reconciliation
### Step VII: Function Components
### Step VIII: Hooks