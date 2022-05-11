import {h, ref} from "../../lib/guide-vue.esm.js";
import {oldArray, newText} from './example.js'

export const ArrayToText = {
    render() {
        return this.change === true ?
            h('div', {}, newText) : h('div', {}, oldArray);

    },
    setup() {
        const change = ref(false);
        window.ischange = () => {
            change.value = true;
        }
        return {
            change
        }
    }
}