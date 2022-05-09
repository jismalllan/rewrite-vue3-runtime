import {h} from "../../lib/guide-vue.esm.js";

export const ExamEmit = {
    render(){
        const emitBtn = h('button',{
            onClick:this.event1
        },'button123')

        const div1 = h('div',{
            class:'a1'
        },'hello this is emit')

        return h(
            'div',
            {},
            [emitBtn]
        )
    },
    setup(props,{emit}){
        const event1 = ()=>{
            // console.log('trigger emit event')
            emit('add-foo-boo',11,20)
            emit('emit1',11,20)
        }

        return{
            event1
        }
    }
}