import {createComponentInstance, setupComponent} from "./component";
import {isObject} from "../shared/index";

export function render(vnode, container) {
    patch(vnode, container);
}

function patch(vnode, container) {
    // 判断是组件还是element
    if (typeof vnode.type === 'string') {
        processElement(vnode,container);
    } else if (isObject(vnode)) {
        processComponent(vnode, container);
    }
}
// element
function processElement(vnode, container) {
    mountElement(vnode,container);
}

function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const {children,props} = vnode;

    if(typeof children === 'string'){
        el.textContent = children;
    }else if(Array.isArray(children)){
        mountChildren(children,el);
    }

    for(const key in props){
        const value = props[key];
        el.setAttribute(key,value);
    }

    container.append(el);
}
function mountChildren(children,container){
    children.forEach(v=>{
        patch(v,container)
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