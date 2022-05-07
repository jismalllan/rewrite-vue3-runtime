import {computed} from "../computed";
import {reactive} from "../reactive";

describe('computed',()=> {
    it('basic', function () {
        const ob = reactive({
            count:1
        })
        const res = computed(()=>{
            return ob.count;
        })
        expect(res.value).toBe(1)
    });

    it('cached', function () {
        const ob = reactive({
            count:1
        })

        // received value must be a mock or spy function
        const getter = jest.fn(()=>{
            return ob.count;
        })
        const res = computed(getter);

        expect(getter).not.toBeCalled();
        expect(res.value).toBe(1);
        expect(getter).toBeCalledTimes(1);

        res.value;
        expect(getter).toBeCalledTimes(1);

        ob.count = 2;
        expect(getter).toBeCalledTimes(1);

        expect(res.value).toBe(2);
        expect(getter).toBeCalledTimes(2);
    });
})