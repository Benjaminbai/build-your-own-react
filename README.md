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
  1. render中的递归存在问题，导致不可中断，因此需要把递归变成可中断的方式，
  2. demo使用requestIdleCallback，执行后会产生一个deadline
  3. deadline不足后，中断当前unitwork，开始下一个unitwork

### Step IV: Fibers
  1. render时初始化第一个nextUnitOfWork
  2. 每一个performUnitOfWork中，创建新的fiber，根据是不是子节点，决定是child节点，还是兄弟节点
  3. 深度优先遍历，有child返回child，没child，有sibling，返回sibling
  4. 没有sibling，返回parent
  
### Step V: Render and Commit Phases
  1. performUnitOfWork存在问题，如果任务中断了，页面没有完全更新
  2. 把里面dom操作抽离
  3. 记录fiber的根
  4. concurrent阶段判断根有没有完整，完整了后执行commit操作
  
### Step VI: Reconciliation
  1. fiber中要保存老节点，进行新老fiber的对比
  2. 如果类型相同，就更新节点
  3. 如果节点不同，且存在新节点，就增加
  4. 如果有老节点，且类型不相同，就删除
  5. 更新节点时，还需要注意属性的替换，如果是事件类型，还要添加事件

### Step VII: Function Components
  1. 如果是函数类型的组件，需要区分开来
  2. 函数组建的处理需要通过fiber.type拿到组件类型
### Step VIII: Hooks
  1. 需要设置全局index变量
  2. 记录当前的fiber，每个fiber都准备一个hooks数组保存起来
  3. 把hook对象push到hooks中
  4. index++，然后返回hook中的state
  5. 在hook中再使用queue数组保存每一次的action，然后执行actions数组，再返回当前的action