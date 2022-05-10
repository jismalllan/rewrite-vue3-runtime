import {createRender} from "../runtime-core";

function createElement(type) {
    return document.createElement(type);
}

function patchProps(el, key, newValue, oldValue) {

    const isOn = x => /^on[A-Z]/.test(x);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, newValue)
    } else if (Array.isArray(newValue)) {
        const str = newValue.join(' ')
        el.setAttribute(key, str)
    } else if (newValue === undefined || newValue === null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, newValue);
    }

}

function insert(el, container) {
    container.append(el);
}

const renderer = createRender({
    createElement,
    patchProps,
    insert
})

export function createApp(args) {
    return renderer.createApp(args);
}

export * from '../runtime-core/index';