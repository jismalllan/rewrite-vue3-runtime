export const App = {
    // vue3
    // template
    render(){
        return h('div','hello,'+this.msg);
    },
    setup(){
        return{
            msg:'rewrite-vue'
        }
    }
}