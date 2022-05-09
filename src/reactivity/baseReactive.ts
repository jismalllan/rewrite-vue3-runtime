import {track, trigger} from "./effect";
import {reactive, readonly} from "./reactive";
import {isObject} from "../shared/index";

const reactiveGet = createGetter(false),
    reactiveSet = createSetter(false),
    readonlyGet = createGetter(true),
    readonlySet = createSetter(true);

// 创建get的高阶函数

function createGetter(isReadonly){
    return function get (target,key){

        // 判断为reactive还是readonly类型
        if(key === 'is_reactive'){
            return !isReadonly;
        }else if (key === 'is_readonly') {
            return isReadonly;
        }

        // 反射原始操作
        const res = Reflect.get(target,key);

        // 递归子项
        if(isObject(res)){
            return isReadonly?readonly(res):reactive(res);
        }

        // 是否进行依赖收集
        if(!isReadonly){
            track(target,key);
        }

        return res;
    }
}

function createSetter(isReadonly){
    if(!isReadonly){
        return function set (target,key,value){

            // 反射修改操作
            const res = Reflect.set(target,key,value)
            // 此处还进行触发依赖
            trigger(target,key)
            return res
        }
    }else {
        return function set (target,key,value){
            console.dir(target)
            console.warn(`以上对象为readonly类型，${key}的值无法更改为${value}`)
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