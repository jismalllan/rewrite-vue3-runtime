import {ShapeFlags} from "../shared/shapeFlags";

export function initSlot(instance, children) {
    const {vnode} = instance;

    if(vnode.shapeFlags & ShapeFlags.SLOTS_CHILDREN){
        normalizeObjectSlots(instance.slots,children);
    }
}

function normalizeObjectSlots(slots,children){
    for (const key in children){
        const value = children[key];
        slots[key] = (props)=> slotConvertArray(value(props));
    }
}

function slotConvertArray(value){
   return Array.isArray(value)?value:[value];
}