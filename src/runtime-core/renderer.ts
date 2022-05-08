import {createComponentInstance, setupComponent} from "./component";

export function render(vnode,container){

    patch(vnode,container);
}

function patch(vnode,container){

    // 判断是组件还是element
    processComponent(vnode,container);

}

function processComponent(vnode,container){

    mountComponent(vnode,container);

}


function mountComponent(vnode,container){

    const instance = createComponentInstance(vnode);

    setupComponent(instance);

    setupRenderEffect(instance,container);
}

function setupRenderEffect(instance,container) {
    const subTree = instance.render();

    patch(subTree,container);
}