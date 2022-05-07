import {isRef, proxyRefs, ref, unRef} from "../ref";
import {effect} from "../effect";
import {isReadonly, reactive} from "../reactive";


describe('ref',()=>{
    it('ref basic', function () {
        const observer = ref(1)

        expect(observer.value).toBe(1)
    });

    it('ref reactive', function () {
        const observer = ref(1)
        let dummy,
            call = 0;
        effect(()=>{
            call++;
            dummy = observer.value;
        })
        expect(call).toBe(1)
        expect(dummy).toBe(1)

        observer.value = 2;
        expect(call).toBe(2)
        expect(dummy).toBe(2)

        observer.value = 2;
        expect(call).toBe(2)
        expect(dummy).toBe(2)

    });

    it('ref nested reactive', function () {
        const observer = ref({
            count:1
        })
        let dummy;
        effect(()=>{
            dummy = observer.value.count;
        })
        expect(dummy).toBe(1)
        observer.value.count = 2;
        expect(dummy).toBe(2)
    });

    it('isRef', function () {
        const ob = ref(1);
        const r = reactive({x:1});

        expect(isRef(ob)).toBe(true);
        expect(isRef(1)).toBe(false);
        expect(isRef(r)).toBe(false);
    });

    it('unRef', function () {
        const ob = ref(1);

        expect(unRef(ob)).toBe(1);
        expect(unRef(1)).toBe(1);

    });

    it('proxyRefs', function () {
        const ob = {
            count:1,
            age:ref(10)
        };
        const p = proxyRefs(ob);

        expect(ob.age.value).toBe(10);
        expect(p.age).toBe(10);

        p.age = 20;
        expect(p.age).toBe(20);

    });
})