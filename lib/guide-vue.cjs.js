'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    const componentInstance = {
        vnode,
        type: vnode.type
    };
    return componentInstance;
}
function setupComponent(instance) {
    // initProps();
    // initSlot();
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        // 如果setup返回值为函数,那么它是一个render函数
        // 如果是一个对象,就把它注入到组件上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 赋值到实例上
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // 保证组件有render
    finishComponentResult(instance);
}
function finishComponentResult(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

const isObject = (obj) => {
    if (obj !== null && typeof obj === 'object') {
        return true;
    }
};

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断是组件还是element
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode)) {
        processComponent(vnode, container);
    }
}
// element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container);
    });
}
// component
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 把rootComponent转化为VNode
            //    此后所有操作基于VNode
            console.log(rootComponent);
            const vnode = createVNode(rootComponent);
            console.log(vnode);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
