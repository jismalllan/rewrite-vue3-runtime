import {reactive,isReactive} from "../reactive";

describe('reactive',()=>{
    it('reactive1', function () {
        const origin = {age:1}
        const observer = reactive(origin)

        expect(observer).not.toBe(origin)
        expect(observer.age).toBe(1)
        expect(isReactive(observer)).toBe(true)
        expect(isReactive(origin)).toBe(false)
    });
})