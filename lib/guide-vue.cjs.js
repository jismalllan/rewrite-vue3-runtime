'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const keyMap = new Map();
keyMap.set('$el', instance => {
    return instance.vnode.el;
});
const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = keyMap.get(key);
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const isObject = (obj) => {
    if (obj !== null && typeof obj === 'object') {
        return true;
    }
};

function createComponentInstance(vnode) {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return componentInstance;
}
function setupComponent(instance) {
    // initProps();
    // initSlot();
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandles);
    const { setup } = Component;
    if (setup) {
        // 如果setup返回值为函数,那么它是一个render函数
        // 如果是一个对象,就把它注入到组件上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 赋值到实例上
    if (isObject(setupResult)) {
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断是组件还是element
    const { shapeFlags } = vnode;
    if (shapeFlags & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlags & 4 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
// element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props, shapeFlags } = vnode;
    if (shapeFlags & 8 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlags & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    for (const key in props) {
        // hasOwnProperty解决报错
        if (props.hasOwnProperty(key)) {
            const value = props[key];
            const isOn = x => /^on[A-Z]/.test(x);
            if (isOn(key)) {
                const eventName = key.slice(2).toLowerCase();
                el.addEventListener(eventName, props[key]);
            }
            else if (isObject(value)) {
                const str = value.join(' ');
                el.setAttribute(key, str);
            }
            else {
                el.setAttribute(key, value);
            }
        }
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
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 等全部subTree初始化完,赋值给vnode
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags: getShapeFlags(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlags |= 8 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 16 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 把rootComponent转化为VNode
            //    此后所有操作基于VNode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
