import {reactive} from "../reactive";
import {effect,stop} from "../effect";

describe('effect', () => {
    it('effect basic dep', () => {
        const user = reactive({
            age: 10
        })
        let nextAge;
        effect(() => {
            nextAge = user.age + 1;
        })
        expect(nextAge).toBe(11);

        user.age++;
        expect(nextAge).toBe(12);
    })

    it('effect return runner', () => {
        let x = 10;
        const runner = effect(() => {
            x++;
            return 'x';
        })
        expect(x).toBe(11);
        let res = runner();
        expect(x).toBe(12);
        expect(res).toBe('x');
    })

    it('effect scheduler', () => {
        // 1.effect第二个参数
        // 2.effect第一次执行本身的函数fn
        // 3.第二次执行scheduler函数
        // 4.runner执行原fn函数

        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner;
        })
        const obj = reactive({foo: 1})
        const runner = effect(() => {
            dummy = obj.foo
        }, {scheduler});

        expect(scheduler).not.toBeCalled();
        expect(dummy).toBe(1);

        obj.foo++;
        expect(scheduler).toBeCalledTimes(1);
        expect(dummy).toBe(1);

        run();
        expect(dummy).toBe(2);
    })

    it('effect stop', () => {
        // 1.stop不再触发依赖
        // 2.恢复依赖触发

        let dummy;
        const obj = reactive({foo: 1})
        const runner = effect(() => {
            dummy = obj.foo
        });

        obj.foo = 2
        expect(dummy).toBe(2);

        stop(runner)
        // obj.foo = 3;
        obj.foo++;
        expect(dummy).toBe(2);

        runner();
        expect(dummy).toBe(3);
    })

    it('effect onstop', () => {
        let dummy;
        const onStop = jest.fn();
        const obj = reactive({foo: 1})
        const runner = effect(() => {
            dummy = obj.foo;
        },{onStop});

        stop(runner)
        expect(onStop).toBeCalledTimes(1);
    })

})