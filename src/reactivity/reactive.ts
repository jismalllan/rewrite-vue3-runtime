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

export {
    reactive,
    readonly,
    isReactive,
    isReadonly
};