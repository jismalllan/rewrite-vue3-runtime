import {reactiveHandlers, readonlyHandlers} from "./baseReactive";
import {isObject} from "../shared/index";

function createActiveObject(raw,handler){
    if(!isObject(raw)){
        console.warn(`target ${raw} is not a object,it cannot be handle by proxy`);
        return;
    }
    return new Proxy(raw,handler)
}

function reactive(raw){
    return createActiveObject(raw,reactiveHandlers)
}

function readonly(raw){
    return createActiveObject(raw,readonlyHandlers)
}

function isReactive(raw){
    return !!raw['is_reactive']
}

function isReadonly(raw){
    return !!raw['is_readonly']
}

function isProxy(raw){
    return isReactive(raw)||isReadonly(raw);
}


export {
    reactive,
    readonly,
    isReactive,
    isReadonly,
    isProxy
};