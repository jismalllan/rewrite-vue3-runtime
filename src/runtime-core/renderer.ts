import {createComponentInstance, setupComponent} from "./component";
import {isObject} from "../shared/index";
import {ShapeFlags} from "../shared/shapeFlags";
import any = jasmine.any;

export function render(vnode, container) {
    patch(vnode, container);
}

function patch(vnode, container) {
    // 判断是组件还是element
    const {shapeFlags} = vnode;

    if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}

// element
function processElement(vnode, container) {
    mountElement(vnode, container);
}

function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const {children, props, shapeFlags} = vnode;

    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }

    for (const key in props) {
        // hasOwnProperty解决报错
        if (props.hasOwnProperty(key)) {
            const value = props[key];

            const isOn = x => /^on[A-Z]/.test(x);

            if (isOn(key)) {
                const eventName = key.slice(2).toLowerCase();
                el.addEventListener(eventName, props[key])
            } else if (isObject(value)) {
                const str = value.join(' ')
                el.setAttribute(key, str)
            } else {
                el.setAttribute(key, value);
            }
        }
    }

    container.append(el);
}

function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container)
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
    const {proxy} = instance;
    const subTree = instance.render.call(proxy);

    patch(subTree, container);

    // 等全部subTree初始化完,赋值给vnode
    vnode.el = subTree.el;
}