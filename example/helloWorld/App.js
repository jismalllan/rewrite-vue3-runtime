import {h} from "../../lib/guide-vue.esm.js";
import {Foo} from "./Foo.js";
import {ExamEmit} from "./ExamEmit.js";
import {ExamSlot} from "./ExamSlot.js"
import {ExamCurrentInstance} from "./ExamCurrentInstance.js"
import {createTextVNode} from "../../lib/guide-vue.esm.js";

export const App = {

    render() {
        // this.$slots
        const slotContent1 = ({age}) => h('div', {class: 'a1'}, 'i am slot1:' + age);
        const slotContent2 = () => [createTextVNode('i am text '),
            h('div', {class: 'a1'}, 'i am slot2')];

        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
                /*               onClick() {
                                   console.log('hello vue3')
                               },*/
            },
            [
                h('h1', {
                    class: ['title', 'size']
                }, 'hello Vue3'),
                /*                h(ExamEmit, {
                                    count: 2,
                                    onEmit1(x, y) {
                                        console.log(`emit1:${x} + ${y}`)
                                    },
                                    onAddFooBoo() {
                                        console.log('add-foo-boo change successfully onAddFooBoo')
                                    }
                                }),*/
                /*                h(ExamSlot, {}, {
                                    header: slotContent1,
                                    footer: slotContent2
                                })*/
                h(ExamCurrentInstance)
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