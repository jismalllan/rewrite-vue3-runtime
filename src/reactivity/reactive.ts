import {reactiveHandlers, readonlyHandlers} from "./baseReactive";

function createActiveObject(raw,handler){
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