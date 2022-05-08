import {h} from "../../lib/guide-vue.esm.js";

window.self = null;

export const App = {
    // vue3
    // template
    render() {
        window.self = this;

        return h('h1',
            {
                id:'rootId',
                class:['a1','a2','a3'],
                onClick(){
                    console.log('hello vue3')
                },
                onMousedown(){
                    console.log('down')
                },
                onMouseenter(){
                    console.log('enter')
                }
            },
                /* [
                h('h1',{
                    class:['title','size']
                },'hello Vue3'),
                h('div',{
                    class:'child2'
                },'i am child2')
                ]*/
            'hello '+this.msg1 + ' ' + this.date1
        );
    },
    setup() {
        return {
            msg1: 'rewrite-vue',
            date1:'2022-5-8'
        }
    }
}