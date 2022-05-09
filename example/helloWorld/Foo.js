import {h} from "../../lib/guide-vue.esm.js";

export const Foo = {
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
        // 3.readonly props
        console.log(props);
        props.count++;
    }
}