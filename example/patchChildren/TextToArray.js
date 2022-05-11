import {h, ref} from "../../lib/guide-vue.esm.js";
import {newArray, newText, oldText} from "./example.js";

export const TextToArray = {
    render() {
        return this.change === false ?
            h('div', {}, oldText) : h('div', {}, newArray);

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