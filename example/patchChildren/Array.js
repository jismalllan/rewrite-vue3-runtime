import {h, ref} from "../../lib/guide-vue.esm.js";


export const Array = {

    render() {
        // 1.左侧对比
        /*const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            // h('p',{key:'C'},'C')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D')
        ];*/

        // 2.右侧对比
        /*const preChild = [
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D')
        ];*/

        // 3.中间对比
        /*const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G'),
            h('p',{key:'H'},'H')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'E'},'E'),
            h('p',{key:'F'},'F'),
            h('p',{key:'H'},'H')
        ];*/

        // 删d
        /*const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'E'},'E'),
            h('p',{key:'C'},'C'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];*/

        // 更改顺序
        /*const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'E'},'E'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'E'},'E'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];*/

        // 更改顺序
        /*const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'E'},'E'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'E'},'E'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];*/

        const preChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'C'},'C'),
            h('p',{key:'D'},'D'),
            h('p',{key:'E'},'E'),
            h('p',{key:'Z'},'Z'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];
        const nextChild = [
            h('p',{key:'A'},'A'),
            h('p',{key:'B'},'B'),
            h('p',{key:'D'},'D'),
            h('p',{key:'C'},'C'),
            h('p',{key:'Y'},'Y'),
            h('p',{key:'E'},'E'),
            h('p',{key:'F'},'F'),
            h('p',{key:'G'},'G')
        ];


        return this.change === false ?
            h('div', {}, preChild) : h('div', {}, nextChild);

    },
    setup() {
        const change = ref(false);
        window.ischange = (value) => {
            change.value = value;
        }
        return {
            change
        }
    }
}