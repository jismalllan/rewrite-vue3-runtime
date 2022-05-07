import get = Reflect.get;
import {ReactiveEffect} from "./effect";

class ComputedImpl{
    private _getter: any;
    private _dirty:boolean = true;
    private _value:any;
    private _effect: ReactiveEffect;

    constructor(getter) {
        this._getter = getter;
        this._effect = new ReactiveEffect(getter);
        this._effect.scheduler = ()=>{
            if(!this._dirty){
                this._dirty = true;
            }
        }
    }

    get value(){
        if(this._dirty){
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}

export function computed(getter){
    return new ComputedImpl(getter);
}
