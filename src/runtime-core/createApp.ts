import {render} from "./renderer";
import {createVNode} from "./vnode";

export function createApp(rootComponent) {

    return {
        mount(rootContainer) {
            // 把rootComponent转化为VNode
            //    此后所有操作基于VNode
            const vnode = createVNode(rootComponent);

            render(vnode, rootContainer);
        }
    }
}