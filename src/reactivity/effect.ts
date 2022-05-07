// dep里要存储的依赖实例
let activeEffect;
// 是否应该依赖收集
let shouldTrack = false;
// 全局依赖收集容器，要储存全部的响应式对象
const targetMaps = new Map();

class ReactiveEffect {
    private _fn: any;
    // deps
    deps = [];
    // active表示是否清除过依赖代码，true表示还没清除过，可以清除
    active = true;
    public onStop?:Function;
    public scheduler?:Function;

    constructor(fn) {
        this._fn = fn;
    }

    run() {
        if(!this.active){
            return this._fn();
        }
        // shouldTrack为false，无法进行依赖收集
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // 执行_fn时，可能读取_fn函数中某些reactive变量，从而触发track逻辑进行依赖收集
        shouldTrack = false;
        return result;
    }
    stop(){
        if(this.active){
            cleanupEffect(this);
            if(this.onStop){
                this.onStop()
            }
            this.active = false;
        }
    }
}

function cleanupEffect(effect){
    effect.deps.forEach(dep=>{
        dep.delete(effect)
    });
    effect.deps.length = 0;
}
// 依赖收集
function isTracking(){
    if(!activeEffect) return false;
    // 没有依赖项，不做收集
    if(!shouldTrack) return false;
    return true;
}

function track(target,key){
    if(!isTracking()) return;

    // targetMaps => depsMap => dep
    let depsMap = targetMaps.get(target);
    if(!depsMap){
        depsMap = new Map();
        targetMaps.set(target,depsMap);
    }

    let dep = depsMap.get(key);
    if(!dep){
        dep = new Set();
        depsMap.set(key,dep);
    }

    if(dep.has(activeEffect)) return;
    trackEffects(dep);
}
function trackEffects(dep){
    // dep要装的是ReactiveEffect的实例,为了收集依赖对象，确保触发全部依赖函数
    dep.add(activeEffect);
    // activeEffect.deps收集了dep，为了stop删除dep中的依赖的activeEffect
    activeEffect.deps.push(dep);
}
// 触发依赖
function trigger(target,key){
    let depsMap = targetMaps.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep)
}

function triggerEffects(dep){
    for(let effect of dep){
        if(effect.scheduler){
            effect.scheduler()
        }else {
            effect.run();
        }
    }
}

function effect(fn,options:any={}) {
    const _effect = new ReactiveEffect(fn);
    Object.assign(_effect,options)

    _effect.run();

    const runner:any = _effect.run.bind(_effect);
    // effect中的函数跟哪些依赖有关
    runner.effect = _effect;

    return runner;
}

function stop(runner){
    runner.effect.stop()
}

export{
    ReactiveEffect,
    isTracking,
    track,
    trackEffects,
    trigger,
    triggerEffects,
    effect,
    stop
}