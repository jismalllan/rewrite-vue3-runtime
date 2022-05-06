import {track, trigger} from "./effect";

const reactiveGet = createGetter(false),
    reactiveSet = createSetter(false),
    readonlyGet = createGetter(true),
    readonlySet = createSetter(true)

// 创建get的高阶函数
function createGetter(isReadonly){
    return function (target,key){
        const res = Reflect.get(target,key);
        // 此处还进行依赖收集
        if(key === 'is_reactive'){
            return !isReadonly
        }else if (key === 'is_readonly') {
            return isReadonly
        }

        if(!isReadonly){
            track(target,key);
        }
        return res;
    }
}

function createSetter(isReadonly){
    if(!isReadonly){
        return function (target,key,value){
            const res = Reflect.set(target,key,value)
            // 此处还进行触发依赖
            trigger(target,key)
            return res
        }
    }else {
        return function (target,key,value){
            console.warn(`因为${target}为readonly类型，${key}的值无法更改为${value}`)
            return true;
        }
    }
}

export const reactiveHandlers = {
    get:reactiveGet,
    set:reactiveSet
}

export const readonlyHandlers = {
    get:readonlyGet,
    set:readonlySet
}