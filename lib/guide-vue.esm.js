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
        key: props && props.key,
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

function createComponentInstance(vnode, parent) {
    const componentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        parent: parent,
        provides: parent ? parent.provides : {},
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

/*let arr = [4,2,3,1,5];
console.log(LengthOfLIS(arr));
console.log(IndexOfLIS(arr));
console.log(NumOfLIS(arr));*/
function IndexOfLIS(num) {
    let len = num.length;
    let max = [num[0]];
    const dp = new Array(len).fill(1).map((v, i) => [[i]]);
    for (let i = 1; i < len; i++) {
        for (let j = 0; j < i; j++) {
            if (num[i] > num[j]) {
                for (let k = 0; k < dp[j].length; k++) {
                    let target = [...dp[j][k], i];
                    dp[i].push(target);
                    if (target.length > max.length) {
                        max = [...target];
                    }
                }
            }
        }
    }
    return max;
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, remove: hostRemove, setText: hostSetText } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(vnode1, vnode2, container, parentComponent, anchor = null) {
        // 判断是组件还是element
        const { type, shapeFlags } = vnode2;
        if (type === Fragment) {
            processFragment(vnode1, vnode2, container, parentComponent);
        }
        else if (type === Text) {
            processText(vnode1, vnode2, container);
        }
        else if (shapeFlags & 1 /* ELEMENT */) {
            processElement(vnode1, vnode2, container, parentComponent, anchor);
        }
        else if (shapeFlags & 4 /* STATEFUL_COMPONENT */) {
            processComponent(vnode1, vnode2, container, parentComponent);
        }
    }
    // vnode1 oldNode
    // vnode2 newNode
    function processFragment(vnode1, vnode2, container, parentComponent) {
        mountChildren(vnode2.children, container, parentComponent);
    }
    function processText(vnode1, vnode2, container) {
        const { children } = vnode2;
        const textNode = (vnode2.el = document.createTextNode(children));
        container.append(textNode);
    }
    // element
    function processElement(vnode1, vnode2, container, parentComponent, anchor) {
        if (!vnode1) {
            mountElement(vnode2, container, parentComponent, anchor);
        }
        else {
            patchElement(vnode1, vnode2, container, parentComponent);
        }
    }
    function patchChild(vnode1, vnode2, elContainer, parentComponent) {
        const preShapeFlags = vnode1.shapeFlags;
        const preChildren = vnode1.children;
        const nextShapeFlags = vnode2.shapeFlags;
        const nextChildren = vnode2.children;
        if (nextShapeFlags & 8 /* TEXT_CHILDREN */) {
            if (preShapeFlags & 16 /* ARRAY_CHILDREN */) {
                unMountChildren(preChildren);
            }
            if (preChildren !== nextChildren) {
                hostSetText(elContainer, nextChildren);
            }
        }
        else {
            // if (nextShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            if (preShapeFlags & 8 /* TEXT_CHILDREN */) {
                hostSetText(elContainer, '');
                mountChildren(nextChildren, elContainer, parentComponent);
            }
            else {
                patchKeyedChildren(preChildren, nextChildren, elContainer, parentComponent);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        let i = 0, e1 = c1.length - 1, e2 = c2.length - 1;
        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧向右移动
        while (i <= e1 && i <= e2) {
            const n1 = c1[i], n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        console.log('i', i);
        // 右侧向左移动
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1], n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        console.log(e1, e2);
        if (i > e1) {
            // 新的比旧的多
            if (i <= e2) {
                const insertNode = e2 + 1;
                const anchor = insertNode < c2.length ? c2[insertNode].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 新的比旧的少
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间乱序
            let s1 = i, s2 = i, patched = 0;
            const tobePatched = e2 - s2 + 1;
            const keyMap = new Map();
            const newIndexToOldIndexMap = new Array(tobePatched).fill(0);
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                let newIndex;
                const preChild = c1[i];
                if (patched >= tobePatched) {
                    hostRemove(preChild.el);
                    continue;
                }
                if (preChild.key !== null) {
                    newIndex = keyMap.get(preChild.key);
                }
                else {
                    console.log('no key');
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(preChild, c2[i])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(preChild.el);
                }
                else {
                    // 新的位置在旧图里的位置
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(preChild, c2[newIndex], container, parentComponent);
                    patched++;
                }
            }
            const increasingSeq = IndexOfLIS(newIndexToOldIndexMap);
            console.log(increasingSeq);
            let j = increasingSeq.length - 1;
            for (let i = tobePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                // 增加
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                // 插入
                if (i !== increasingSeq[j]) {
                    console.log('移动位置');
                    hostInsert(nextChild.el, container, anchor);
                }
                else {
                    j--;
                }
            }
        }
    }
    function unMountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i].el;
            hostRemove(child);
        }
    }
    function patchElement(vnode1, vnode2, container, parentComponent) {
        const oldProps = vnode1.props || EMPTY_OBJ;
        const newProps = vnode2.props || EMPTY_OBJ;
        const el = (vnode2.el = vnode1.el);
        patchChild(vnode1, vnode2, el, parentComponent);
        // 传递的元素属性改变
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
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props, shapeFlags } = vnode;
        if (shapeFlags & 8 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlags & 16 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent);
        }
        for (const key in props) {
            // hasOwnProperty解决报错
            const value = props[key];
            hostPatchProps(el, key, value);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach(vnode => {
            patch(null, vnode, container, parentComponent);
        });
    }
    // component
    function processComponent(vnode1, vnode2, container, parentComponent) {
        mountComponent(vnode2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                // 等全部subTree初始化完,赋值给vnode
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppInterface(render)
    };
}

function provide(key, value) {
    const instance = getCurrentInstance();
    if (instance) {
        const { provides } = instance;
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getCurrentInstance();
    if (instance) {
        const provides = instance.parent.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
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
function insert(el, container, anchor = null) {
    container.insertBefore(el, anchor);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setText(el, text) {
    el.textContent = text;
}
const renderer = createRender({
    createElement,
    patchProps,
    insert,
    remove,
    setText
});
function createApp(args) {
    return renderer.createApp(args);
}

export { Fragment, Text, createApp, createRender, createTextVNode, getCurrentInstance, h, inject, isProxy, isReactive, isReadonly, isRef, provide, proxyRefs, reactive, readonly, ref, renderSlots, unRef };
