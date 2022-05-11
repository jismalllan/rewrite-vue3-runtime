import {createComponentInstance, setupComponent} from "./component";
import {EMPTY_OBJ, ShapeFlags} from "../shared/shapeFlags";
import {Fragment, Text} from "./vnode";
import {effect} from "../reactivity/effect";
import {createAppInterface} from "./createApp";

export function createRender(options) {

    const {
        createElement: hostCreateElement,
        patchProps: hostPatchProps,
        insert: hostInsert
    } = options;

    function render(vnode, container) {
        patch(null, vnode, container, null);
    }

    function patch(vnode1, vnode2, container,parentComponent) {
        // 判断是组件还是element
        const {type, shapeFlags} = vnode2;

        if (type === Fragment) {
            processFragment(vnode1, vnode2, container,parentComponent);
        } else if (type === Text) {
            processText(vnode1, vnode2, container);
        } else if (shapeFlags & ShapeFlags.ELEMENT) {
            processElement(vnode1, vnode2, container,parentComponent);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(vnode1, vnode2, container,parentComponent);
        }
    }

// vnode1 oldNode
// vnode2 newNode
    function processFragment(vnode1, vnode2, container,parentComponent) {
        mountChildren(vnode2.children, container,parentComponent);
    }

    function processText(vnode1, vnode2, container) {
        const {children} = vnode2;
        const textNode = (vnode2.el = document.createTextNode(children));
        container.append(textNode);
    }

// element
    function processElement(vnode1, vnode2, container,parentComponent) {

        if (!vnode1) {
            mountElement(vnode2, container,parentComponent);
        } else {
            patchElement(vnode1, vnode2, container);
        }
    }

    function patchElement(vnode1, vnode2, container) {
        console.log('patch')
        console.log('pe1', vnode1)
        console.log('pe2', vnode2)

        const oldProps = vnode1.props || EMPTY_OBJ;
        const newProps = vnode2.props || EMPTY_OBJ;

        const el = (vnode2.el = vnode1.el);

        patchElementProps(el, oldProps, newProps);
    }


    function patchElementProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const preV = oldProps[key];
                const newV = newProps[key];

                if (preV !== newV) {
                    hostPatchProps(el, key, newV, preV);
                }
            }
            if(oldProps!==EMPTY_OBJ){
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, null)
                    }
                }
            }
        }
    }

    function mountElement(vnode, container,parentComponent) {

        const el = (vnode.el = hostCreateElement(vnode.type));

        const {children, props, shapeFlags} = vnode;
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el,parentComponent);
        }

        for (const key in props) {
            // hasOwnProperty解决报错
            const value = props[key];
            hostPatchProps(el, key, value);
        }
        hostInsert(el, container);
    }

    function mountChildren(children, container,parentComponent) {
        children.forEach(v => {
            patch(null, v, container,parentComponent)
        });
    }

// component
    function processComponent(vnode1, vnode2, container,parentComponent) {

        mountComponent(vnode2, container,parentComponent);

    }

    function mountComponent(vnode, container,parentComponent) {

        const instance = createComponentInstance(vnode,parentComponent);

        setupComponent(instance);

        setupRenderEffect(instance, vnode, container);
    }

    function setupRenderEffect(instance, vnode, container) {

        effect(() => {
            if (!instance.isMounted) {
                const {proxy} = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));

                patch(null, subTree, container,instance);
                // 等全部subTree初始化完,赋值给vnode
                vnode.el = subTree.el;
                instance.isMounted = true;
            } else {

                const {proxy} = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;

                patch(preSubTree, subTree, container,instance);
            }
        })
    }

    return {
        createApp: createAppInterface(render)
    }
}