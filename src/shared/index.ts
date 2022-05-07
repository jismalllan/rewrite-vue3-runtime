export const extend = Object.assign

export const isObject = (obj)=>{
        if(obj !== null && typeof obj === 'object'){
            return true
        }
}

export const hasChanged = (newValue,oldValue)=>{
    return !Object.is(newValue,oldValue);
}