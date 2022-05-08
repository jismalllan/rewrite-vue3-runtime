export function createComponentInstance(vnode){

    const componentInstance = {
        vnode,
        type:vnode.type
    }

    return componentInstance;
}

export function setupComponent(instance) {

    // initProps();
    // initSlot();
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance){
    const component = instance.type;
    const {setup} = component;

    if(setup){
        // 如果setup返回值为函数,那么它是一个render函数
        // 如果是一个对象,就把它注入到组件上下文中
        const setupResult = setup();

        handleSetupResult(instance,setupResult);
    }
}

function handleSetupResult(instance,setupResult: any) {

    // 赋值到实例上
    if(typeof setupResult === 'object'){
        instance.setupState = setupResult;
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