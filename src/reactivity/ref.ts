import {isTracking, trackEffects, triggerEffects} from "./effect";
import {hasChanged, isObject} from "../shared/index";
import {reactive} from "./reactive";

function selectConvertReactive(value){
    return isObject(value)?reactive(value): value
}

class RefImpl{
    private _value: any;
    public _rawValue:any;
    public dep;
    public __v_isRef = true;

    constructor(value) {
        this._rawValue = value;
        this._value = selectConvertReactive(value);
        this.dep = new Set();
    }

    get value(){
        if(isTracking()){
            trackEffects(this.dep);
        }
        return this._value;
    }

    set value(newValue){
        if(hasChanged(newValue,this._rawValue)){
            this._rawValue = newValue;
            this._value = selectConvertReactive(newValue);
            triggerEffects(this.dep);
        }
    }
}


function ref(value){
    return new RefImpl(value)
}

function isRef(value){
    return !!value.__v_isRef;
}

function unRef(ref){
    return isRef(ref)?ref.value:ref;
}

function proxyRefs(ref){
    return new Proxy(ref,{
        get(target: any, key): any {
            return unRef(Reflect.get(target,key));
        },
        set(target: any, key,value):boolean {
            if( isRef(target[key])&& !isRef(value) ){
                return target[key].value = value;
            }else {
                return Reflect.set(target,key,value);
            }
        }
    })
}

export {
    ref,
    isRef,
    unRef,
    proxyRefs
}