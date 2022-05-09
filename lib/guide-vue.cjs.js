'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (obj) => {
    if (obj !== null && typeof obj === 'object') {
        return true;
    }
};
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

const keyMap = new Map();
keyMap.set('$el', instance => {
    return instance.vnode.el;
});
const publicInstanceProxyHandles = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // if(key in setupState){
        //     return setupState[key];
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = keyMap.get(key);
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// dep里要存储的依赖实例
let activeEffect;
// 全局依赖收集容器，要储存全部的响应式对象
const targetMaps = new Map();
// 依赖收集
function isTracking() {
    return false;
}
function track(target, key) {
    if (!isTracking())
        return;
    // targetMaps => depsMap => dep
    let depsMap = targetMaps.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMaps.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    if (dep.has(activeEffect))
        return;
    trackEffects(dep);
}
function trackEffects(dep) {
    // dep要装的是ReactiveEffect的实例,为了收集依赖对象，确保触发全部依赖函数
    dep.add(activeEffect);
    // activeEffect.deps收集了dep，为了stop删除dep中的依赖的activeEffect
    activeEffect.deps.push(dep);
}
// 触发依赖
function trigger(target, key) {
    let depsMap = targetMaps.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const reactiveGet = createGetter(false), reactiveSet = createSetter(false), readonlyGet = createGetter(true), readonlySet = createSetter(true);
// 创建get的高阶函数
function createGetter(isReadonly) {
    return function get(target, key) {
        // 判断为reactive还是readonly类型
        if (key === 'is_reactive') {
            return !isReadonly;
        }
        else if (key === 'is_readonly') {
            return isReadonly;
        }
        // 反射原始操作
        const res = Reflect.get(target, key);
        // 递归子项
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 是否进行依赖收集
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter(isReadonly) {
    if (!isReadonly) {
        return function set(target, key, value) {
            // 反射修改操作
            const res = Reflect.set(target, key, value);
            // 此处还进行触发依赖
            trigger(target, key);
            return res;
        };
    }
    else {
        return function set(target, key, value) {
            console.dir(target);
            console.warn(`以上对象为readonly类型，${key}的值无法更改为${value}`);
            return true;
        };
    }
}
const reactiveHandlers = {
    get: reactiveGet,
    set: reactiveSet
};
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet
};

function createActiveObject(raw, handler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not a object,it cannot be handle by proxy`);
        return;
    }
    return new Proxy(raw, handler);
}
function reactive(raw) {
    return createActiveObject(raw, reactiveHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const capitalize = str => {
        return str.slice(0, 1).toUpperCase() + str.slice(1);
    };
    const camelize = str => {
        const arr = str.split('-');
        return arr.map(i => capitalize(i)).join('');
    };
    const onHandlerEvent = str => {
        return str ? 'on' + str : str;
    };
    onHandlerEvent(capitalize(event));
    const kebabConvert = onHandlerEvent(camelize(event));
    const handler = props[kebabConvert];
    handler && handler(...args);
}

function createComponentInstance(vnode) {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        emit: () => { }
    };
    componentInstance.emit = emit.bind(null, componentInstance);
    return componentInstance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(readonly(instance.props), {
            emit: instance.emit
        });
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
