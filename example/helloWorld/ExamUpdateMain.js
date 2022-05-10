import {h, ref} from "../../lib/guide-vue.esm.js";

export const ExamUpdateMain = {
    render() {
        return h(
            'div',
            {},
            [
                h('div', {}, 'count:' + this.count),
                h('button', {onClick: this.fn}, 'this is click'),
                h('div',
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
                    ])
            ]
        )
    },
    setup(props) {
        // +1
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
            props1.value.foo = undefined;
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