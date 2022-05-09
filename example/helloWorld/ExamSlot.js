import {h, renderSlots} from "../../lib/guide-vue.esm.js";

export const ExamSlot = {
    render(){
        console.log(this.$slots)

        const div1 = h('div',{
            class:'a1'
        },'hello this is div1')

        return h(
            'div',
            {},
            [renderSlots(this.$slots,'header'),div1,renderSlots(this.$slots,'footer')],
        )
    },
    setup(props,{emit}){

    }
}