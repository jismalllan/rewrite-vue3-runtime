import {isReadonly, readonly} from "../reactive";

describe('readonly',()=>{
    it('r1', function () {
        const origin = {age:1}
        const observer = readonly(origin)

        // observer.age++;
        expect(observer).not.toBe(origin)
        expect(observer.age).toBe(1)
    });

    it('r2', function () {
        console.warn = jest.fn()
        const origin = {age:1}
        const observer = readonly(origin)

        observer.age++;
        expect(console.warn).toBeCalled()
        expect(isReadonly(observer)).toBe(true)
    });
})