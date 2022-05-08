const keyMap = new Map()
keyMap.set('$el',instance=>{
    return instance.vnode.el;
})

export const publicInstanceProxyHandles = {
    get({_:instance},key){
        const {setupState} = instance;
        if(key in setupState){
            return setupState[key];
        }

        const publicGetter = keyMap.get(key);
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}