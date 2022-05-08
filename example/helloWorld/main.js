import {App} from "./App.js";
import {createApp} from "../../lib/guide-vue.esm.js";

const app = document.querySelector('#app');
createApp(App).mount(app);