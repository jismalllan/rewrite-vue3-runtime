import {h} from "../../lib/guide-vue.esm.js";
import {Foo} from "./Foo.js";
import {ExamEmit} from "./ExamEmit.js";
import {ExamSlot} from "./ExamSlot.js"

export const App = {
    // vue3
    // template
    render() {
        // this.$slots
        const slotContent1 = h('div', {class: 'a1'}, 'i am slot111');
        const slotContent2 = h('div', {class: 'a1'}, 'i am slot2');

        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
                // onClick() {
                //     console.log('hello vue3')
                // },
            },
            [
                h('h1', {
                    class: ['title', 'size']
                }, 'hello Vue3'),
                h(ExamEmit, {
                    count: 2,
                    onEmit1(x, y) {
                        console.log(`emit1:${x} + ${y}`)
                    },
                    onAddFooBoo() {
                        console.log('change add-foo-b')
                    }
                }),
                h(ExamSlot, {}, {
                    header: slotContent1,
                    footer: slotContent2
                })
            ]
            // 'hello '+this.msg1 + ' ' + this.date1
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1: '2022-5-8'
        }
    }
}