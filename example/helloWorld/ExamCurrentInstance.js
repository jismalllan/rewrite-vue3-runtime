import {getCurrentInstance, h} from "../../lib/guide-vue.esm.js";

export const ExamCurrentInstance = {
    name:'ExamCI',
    render(){
        return h(
            'div',
            {},
            'hello:' + this.i
        )
    },
    setup(props){
        const instance = getCurrentInstance();
        console.log('name:exam-current-instance')
        console.log(instance)
        const i = 'get current instance'
        return{
            i,
            instance
        }
    }
}