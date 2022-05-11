import {h, provide, inject} from "../../lib/guide-vue.esm.js";

export const ExamProvide = {
    render() {
        return h(
            'div',
            {id: 'examProvide'},
            [h(Provide1)]
        )
    },
    setup(props) {
        provide('foo', 'exam value');
        provide('bar', 'hello');
    }
}

const Provide1 = {
    render() {
        return h(
            'div',
            {id: 'provide1'},
            [h('p', {}, 'provide1:'+this.foo), h(Provide2)]
        )
    },
    setup(props) {
        const foo = inject('foo')

        return {
            foo
        }
    }
}

const Provide2 = {
    render() {
        return h(
            'div',
            {id: 'provide2'},
            'i am provide2:'+this.foo
        )
    },
    setup(props) {
        const foo = inject('bar1',()=>'default')

        return{
            foo
        }
    }
}