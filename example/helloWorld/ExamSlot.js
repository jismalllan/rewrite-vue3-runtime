import {h, renderSlots} from "../../lib/guide-vue.esm.js";

export const ExamSlot = {
    render() {
        // 1.具名插槽：外部传到组件内部
        console.log(this.$slots)

        const div1 = h('div', {
            class: 'a1'
        }, 'hello this is div1')

        // 2.作用域插槽：组件内部数据传到组件外部使用
        const age = 18;

        return h(
            'div',
            {},
            [renderSlots(this.$slots, 'header', {age})
                , div1, renderSlots(this.$slots, 'footer')],
        )
    },
    setup(props, {emit}) {

    }
}