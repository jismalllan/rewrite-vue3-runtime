import {h} from "../../lib/guide-vue.esm.js";
import {ArrayToArray} from "./ArrayToArray.js";
import {ArrayToText} from "./ArrayToText.js";
import {TextToText} from "./TextToText.js";
import {TextToArray} from "./TextToArray.js";


export const App = {
    render() {
        return h('div',
            {
                id: 'rootId',
            },
            [
                // h(ArrayToArray),
                // h(ArrayToText),
                // h(TextToText),
                h(TextToArray)
            ]
        );
    },
    setup() {

    }
}



