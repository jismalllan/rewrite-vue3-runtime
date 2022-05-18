import {h, ref} from "../../lib/guide-vue.esm.js";
import {newArray, oldArray, oldText} from "./example.js";

export const ArrayToArray = {
    render() {
        return this.change === false ?
            h('div', {}, oldArray) : h('div', {}, newArray);

    },
    setup() {
        const change = ref(false);
        window.ischange = (value) => {
            change.value = value;
        }
        return {
            change
        }
    }
}