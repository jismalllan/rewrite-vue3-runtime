import {h} from "../../lib/guide-vue.esm.js";

export const ExamProps = {
    render(){
        // 2.打印this.count
        return h(
            'div',
            {},
            'hello world:' + this.count
        )
    },
    setup(props){
        // 1.props.count;
        console.log(props);

        // 3.readonly props
        props.count++;
    }
}