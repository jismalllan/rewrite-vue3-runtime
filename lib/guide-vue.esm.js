// dep里要存储的依赖实例
let activeEffect;
// 是否应该依赖收集
let shouldTrack = false;
// 全局依赖收集容器，要储存全部的响应式对象
const targetMaps = new Map();
class ReactiveEffect {
    constructor(fn) {
        // deps
        this.deps = [];
        // active表示是否清除过依赖代码，true表示还没清除过，可以清除
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        // shouldTrack为false，无法进行依赖收集
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // 执行_fn时，可能读取_fn函数中某些reactive变量，从而触发track逻辑进行依赖收集
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
// 依赖收集
function isTracking() {
    if (!activeEffect)
        return false;
    // 没有依赖项，不做收集
    if (!shouldTrack)
        return false;
    return true;
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
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    Object.assign(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // effect中的函数跟哪些依赖有关
    runner.effect = _effect;
    return runner;
}

const isObject = (obj) => {
    if (obj !== null && typeof obj === 'object') {
        return true;
    }
};
const hasChanged = (newValue, oldValue) => {
    return !Object.is(newValue, oldValue);
};
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
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
function isReactive(raw) {
    return !!raw['is_reactive'];
}
function isReadonly(raw) {
    return !!raw['is_readonly'];
}
function isProxy(raw) {
    return isReactive(raw) || isReadonly(raw);
}

function selectConvertReactive(value) {
    return isObject(value) ? reactive(value) : value;
}
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = selectConvertReactive(value);
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = selectConvertReactive(newValue);
            triggerEffects(this.dep);
        }
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(value) {
    return !!value.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(ref) {
    return new Proxy(ref, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    if (vnode.shapeFlags & 4 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlags |= 32 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlags(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const keyMap = new Map();
keyMap.set('$el', i => {
    return i.vnode.el;
});
keyMap.set('$slots', i => {
    return i.slots;
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

function emitSum(instance, event, ...args) {
    const { props } = instance;
    const eventName = onHandlerEvent(camelize(event));
    const handler = props[eventName];
    handler && handler(...args);
}

function initSlot(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlags & 32 /* SLOTS_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => slotConvertArray(value(props));
    }
}
function slotConvertArray(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        parent: null,
        isMounted: false,
        subTree: {}
    };
    componentInstance.emit = emitSum.bind(null, componentInstance);
    return componentInstance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlot(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
let currentInstance = null;
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandles);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // 如果setup返回值为函数,那么它是一个render函数
        // 如果是一个对象,就把它注入到组件上下文中
        const setupResult = setup(readonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 赋值到实例上
    if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
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
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(value) {
    currentInstance = value;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const EMPTY_OBJ = {};

function createAppInterface(render) {
    // 为了传入render渲染函数
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                let rootElement;
                // 把rootComponent转化为VNode
                //    此后所有操作基于VNode
                const vnode = createVNode(rootComponent);
                if (typeof rootContainer === 'string') {
                    rootElement = document.querySelector(rootContainer);
                }
                else {
                    rootElement = rootContainer;
                }
                render(vnode, rootElement);
            }
        };
    };
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert } = options;
    function render(vnode, container) {
        patch(null, vnode, container);
    }
    function patch(vnode1, vnode2, container) {
        // 判断是组件还是element
        const { type, shapeFlags } = vnode2;
        if (type === Fragment) {
            processFragment(vnode1, vnode2, container);
        }
        else if (type === Text) {
            processText(vnode1, vnode2, container);
        }
        else if (shapeFlags & 1 /* ELEMENT */) {
            processElement(vnode1, vnode2, container);
        }
        else if (shapeFlags & 4 /* STATEFUL_COMPONENT */) {
            processComponent(vnode1, vnode2, container);
        }
    }
    // vnode1 oldNode
    // vnode2 newNode
    function processFragment(vnode1, vnode2, container) {
        mountChildren(vnode2.children, container);
    }
    function processText(vnode1, vnode2, container) {
        const { children } = vnode2;
        const textNode = (vnode2.el = document.createTextNode(children));
        container.append(textNode);
    }
    // element
    function processElement(vnode1, vnode2, container) {
        if (!vnode1) {
            mountElement(vnode2, container);
        }
        else {
            patchElement(vnode1, vnode2);
        }
    }
    function patchElement(vnode1, vnode2, container) {
        console.log('patch');
        console.log('pe1', vnode1);
        console.log('pe2', vnode2);
        const oldProps = vnode1.props || EMPTY_OBJ;
        const newProps = vnode2.props || EMPTY_OBJ;
        const el = (vnode2.el = vnode1.el);
        patchElementProps(el, oldProps, newProps);
    }
    function patchElementProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const preV = oldProps[key];
                const newV = newProps[key];
                if (preV !== newV) {
                    hostPatchProps(el, key, newV, preV);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props, shapeFlags } = vnode;
        if (shapeFlags & 8 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlags & 16 /* ARRAY_CHILDREN */) {
            mountChildren(children, el);
        }
        for (const key in props) {
            // hasOwnProperty解决报错
            const value = props[key];
            hostPatchProps(el, key, value);
        }
        hostInsert(el, container);
    }
    function mountChildren(children, container) {
        children.forEach(v => {
            patch(null, v, container);
        });
    }
    // component
    function processComponent(vnode1, vnode2, container) {
        mountComponent(vnode2, container);
    }
    function mountComponent(vnode, container) {
        const instance = createComponentInstance(vnode);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container);
                // 等全部subTree初始化完,赋值给vnode
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container);
            }
        });
    }
    return {
        createApp: createAppInterface(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, newValue, oldValue) {
    const isOn = x => /^on[A-Z]/.test(x);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, newValue);
    }
    else if (Array.isArray(newValue)) {
        const str = newValue.join(' ');
        el.setAttribute(key, str);
    }
    else if (newValue === undefined || newValue === null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, newValue);
    }
}
function insert(el, container) {
    container.append(el);
}
const renderer = createRender({
    createElement,
    patchProps,
    insert
});
function createApp(args) {
    return renderer.createApp(args);
}

export { Fragment, Text, createApp, createRender, createTextVNode, getCurrentInstance, h, isProxy, isReactive, isReadonly, isRef, proxyRefs, reactive, readonly, ref, renderSlots, unRef };
