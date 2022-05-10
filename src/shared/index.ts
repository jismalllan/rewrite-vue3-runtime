export const extend = Object.assign


export const isObject = (obj)=>{
        if(obj !== null && typeof obj === 'object'){
            return true
        }
}

export const hasChanged = (newValue,oldValue)=>{
    return !Object.is(newValue,oldValue);
}

export function hasOwn(obj,key){
    return  Object.prototype.hasOwnProperty.call(obj,key);
}

export const capitalize = str => {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

export const camelize = str =>{
    const arr = str.split('-')
    return arr.map(i => capitalize(i)).join('')
}

export const onHandlerEvent = str => {
    return str ? 'on' + str : str;
}