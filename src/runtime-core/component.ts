import {publicInstanceProxyHandles} from "./componentPublicInstance";
import {isObject} from "../shared/index";
import {initProps} from "./componentProps";
import {readonly} from "../reactivity/reactive";
import {emitSum} from "./componentEmit";
import {initSlot} from "./componentSlots";
import {proxyRefs} from "../reactivity/ref";

export function createComponentInstance(vnode){

    const componentInstance = {
        vnode,
        type:vnode.type,
        setupState:{},
        props:{},
        slots:{},
        emit:()=>{},
        parent:null,
        isMounted:false,
        subTree:{}
    }
    componentInstance.emit = emitSum.bind(null,componentInstance)as any;

    return componentInstance;
}

export function setupComponent(instance) {
    initProps(instance,instance.vnode.props);
    initSlot(instance,instance.vnode.children);
    setupStatefulComponent(instance);
}

let currentInstance = null;
function setupStatefulComponent(instance){
    const Component = instance.type;

    instance.proxy = new Proxy({_:instance},publicInstanceProxyHandles)

    const {setup} = Component;
    if(setup){
        setCurrentInstance(instance);
        // 如果setup返回值为函数,那么它是一个render函数
        // 如果是一个对象,就把它注入到组件上下文中
        const setupResult = setup(readonly(instance.props),{
            emit:instance.emit
        });
        setCurrentInstance(null);

        handleSetupResult(instance,setupResult);
    }
}

function handleSetupResult(instance,setupResult: any) {

    // 赋值到实例上
    if(isObject(setupResult)){
        instance.setupState = proxyRefs(setupResult);
    }

    // 保证组件有render
    finishComponentResult(instance);
}

function finishComponentResult(instance) {
    const Component = instance.type;

    if(Component.render){
        instance.render = Component.render;
    }

}
export function getCurrentInstance(){
    return currentInstance;
}

function setCurrentInstance(value){
    currentInstance = value;
}