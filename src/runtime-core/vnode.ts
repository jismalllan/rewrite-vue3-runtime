import {ShapeFlags} from "../shared/shapeFlags";
import {isObject} from "../shared/index";

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlags: getShapeFlags(type)
    };

    if(typeof children === 'string'){
        vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN;
    }else if(Array.isArray(children)){
        vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN;
    }

    if(vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT){
        if(isObject(children)){
            vnode.shapeFlags |= ShapeFlags.SLOTS_CHILDREN;
        }
    }

    return vnode;
}

function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}