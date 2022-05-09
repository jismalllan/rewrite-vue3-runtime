import {camelize, onHandlerEvent} from "../shared/index";

export function emitSum(instance, event,...args) {

    const {props} = instance;

    const eventName = onHandlerEvent(camelize(event));

    const handler = props[eventName];
    handler && handler(...args);
}