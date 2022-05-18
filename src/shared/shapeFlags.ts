export const enum ShapeFlags{
    ELEMENT = 1, // 0001
    FUNCTIONAL_COMPONENT = 1 << 1,// 0010
    STATEFUL_COMPONENT= 1 << 2, // 0100
    TEXT_CHILDREN = 1 << 3, // 00 1000
    ARRAY_CHILDREN = 1 << 4, // 01 0000
    SLOTS_CHILDREN = 1 << 5 // 10 0000
}

export const EMPTY_OBJ = {};
