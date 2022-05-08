import {h} from "../../lib/guide-vue.esm.js";

export const App = {
    // vue3
    // template
    render() {
        return h('div',
            {
                id:'root',
            },
            [
                h('h1',{
                    class:['title','size']
                },'hello Vue3'),
                h('div',{
                    class:'child2'
                },'i am child2')
                ]);
    },
    setup() {
        return {
            msg: 'rewrite-vue'
        }
    }
}