import {createVNode} from "./vnode";

export function createAppInterface(render) {
    // 为了传入render渲染函数
    return function createApp(rootComponent) {

        return {
            mount(rootContainer) {
                let rootElement;
                // 把rootComponent转化为VNode
                //    此后所有操作基于VNode
                const vnode = createVNode(rootComponent);
                if(typeof rootContainer === 'string'){
                    rootElement = document.querySelector(rootContainer)
                }else {
                    rootElement = rootContainer;
                }
                render(vnode, rootElement);
            }
        }
    }
}