import {h, ref} from "../../lib/guide-vue.esm.js";
import {createTextVNode} from "../../lib/guide-vue.esm.js";
import {ExamCurrentInstance} from "./ExamCurrentInstance.js"
import {ExamUpdateMain} from "./ExamUpdateMain.js";
import {ExamProps} from "./ExamProps.js";
import {ExamEmit} from "./ExamEmit.js";
import {ExamSlot} from "./ExamSlot.js"

// return
/*
export const App = {
    render() {
        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
            },
            'return ' + this.msg1 + ' ' + this.date1
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1: '2022-5-10'
        }
    }
}
*/

// currentInstance
/*export const App = {
    render() {
        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
                onClick() {
                    console.log('hello vue3')
                },
            },
            [
                h('h1', {
                    class: ['title', 'size']
                }, 'hello Vue3'),
                h(ExamCurrentInstance)
            ]
        );
    },
    setup() {
        return {
            date1: '2022-5-8'
        }
    }
}*/

// emit
/*export const App = {
    render() {
        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
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
                        console.log('add-foo-boo change successfully onAddFooBoo')
                    }
                }),
            ]
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1: '2022-5-8'
        }
    }
}*/

// slots
/*export const App = {
    render() {
        const slotContent1 = ({age}) => h('div', {class: 'a1'}, 'i am slot1:' + age);
        const slotContent2 = () => [createTextVNode('i am text '),
            h('div', {class: 'a1'}, 'i am slot2')];

        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
            },
            [
                h('h1', {
                    class: ['title', 'size']
                }, 'hello Vue3'),
                h(ExamSlot, {}, {
                    header: slotContent1,
                    footer: slotContent2
                })
            ]
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1: '2022-5-8'
        }
    }
}*/

// props
/*export const App = {
    render() {
        return h('h1',
            {
                id: 'rootId',
                class: ['a1', 'a2', 'a3'],
                onClick() {
                    console.log('hello vue3')
                },
            },
            [
                h('h1', {
                    class: ['title', 'size']
                }, 'hello Vue3'),
                h(ExamProps,{
                    count:108
                })
            ]
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1: '2022-5-8'
        }
    }
}*/

//updateMain
export const App = {
    render() {
        return h('div',
            {
                ...this.props1
            },
            [
                h('div', {
                    onClick: this.propsDemo1
                }, this.props1.foo),
                h('button', {
                    onClick: this.propsDemo1
                }, 'propsChangeDemo1'),
                h('button', {
                    onClick: this.propsDemo2
                }, 'propsChangeDemo2'),
                h('button', {
                    onClick: this.propsDemo3
                }, 'propsChangeDemo3')
            ]);
    },
    setup() {
        const count = ref(0);

        const fn = () => {
            count.value++;
        }
        // props

        const props1 = ref({
            foo: 'foo',
            bar: 'bar'
        })
        const propsDemo1 = () => {
            props1.value.foo = 'newFoo';
        }
        const propsDemo2 = () => {
            props1.value = {
                foo: undefined,
                bar: 'hello'
            }
        }
        const propsDemo3 = () => {
            props1.value = {
                bar: '333'
            }
        }

        return {
            count,
            fn,
            props1,
            propsDemo1,
            propsDemo2,
            propsDemo3
        }
    }
}



