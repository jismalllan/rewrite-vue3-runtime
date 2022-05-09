import has = Reflect.has;
import {hasOwn} from "../shared/index";

const keyMap = new Map()
keyMap.set('$el',instance=>{
    return instance.vnode.el;
})

export const publicInstanceProxyHandles = {
    get({_:instance},key){
        const {setupState,props} = instance;
        // if(key in setupState){
        //     return setupState[key];
        // }

        if(hasOwn(setupState,key)){
            return setupState[key];
        }else if(hasOwn(props,key)){
            return props[key];
        }

        const publicGetter = keyMap.get(key);
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}