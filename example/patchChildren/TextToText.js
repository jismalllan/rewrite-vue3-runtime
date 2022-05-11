import {h, ref} from "../../lib/guide-vue.esm.js";
import {newText, oldArray, oldText} from "./example.js";

export const TextToText = {
    render() {
        return this.change === false ?
            h('div', {}, oldText) : h('div', {}, newText);

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