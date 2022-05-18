import {createComponentInstance, setupComponent} from "./component";
import {EMPTY_OBJ, ShapeFlags} from "../shared/shapeFlags";
import {Fragment, Text} from "./vnode";
import {effect} from "../reactivity/effect";
import {createAppInterface} from "./createApp";
import {IndexOfLIS} from "./LIS";

export function createRender(options) {

    const {
        createElement: hostCreateElement,
        patchProps: hostPatchProps,
        insert: hostInsert,
        remove: hostRemove,
        setText: hostSetText
    } = options;

    function render(vnode, container) {
        patch(null, vnode, container, null);
    }

    function patch(vnode1, vnode2, container, parentComponent, anchor = null) {
        // 判断是组件还是element
        const {type, shapeFlags} = vnode2;

        if (type === Fragment) {
            processFragment(vnode1, vnode2, container, parentComponent);
        } else if (type === Text) {
            processText(vnode1, vnode2, container);
        } else if (shapeFlags & ShapeFlags.ELEMENT) {
            processElement(vnode1, vnode2, container, parentComponent, anchor);
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(vnode1, vnode2, container, parentComponent);
        }
    }

// vnode1 oldNode
// vnode2 newNode
    function processFragment(vnode1, vnode2, container, parentComponent) {
        mountChildren(vnode2.children, container, parentComponent);
    }

    function processText(vnode1, vnode2, container) {
        const {children} = vnode2;
        const textNode = (vnode2.el = document.createTextNode(children));
        container.append(textNode);
    }

// element
    function processElement(vnode1, vnode2, container, parentComponent, anchor) {

        if (!vnode1) {
            mountElement(vnode2, container, parentComponent, anchor);
        } else {
            patchElement(vnode1, vnode2, container, parentComponent);
        }
    }

    function patchChild(vnode1, vnode2, elContainer, parentComponent) {
        const preShapeFlags = vnode1.shapeFlags;
        const preChildren = vnode1.children;
        const nextShapeFlags = vnode2.shapeFlags;
        const nextChildren = vnode2.children;

        if (nextShapeFlags & ShapeFlags.TEXT_CHILDREN) {
            if (preShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
                unMountChildren(preChildren);
            }
            if (preChildren !== nextChildren) {
                hostSetText(elContainer, nextChildren);
            }
        } else {
            // if (nextShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            if (preShapeFlags & ShapeFlags.TEXT_CHILDREN) {
                hostSetText(elContainer, '');
                mountChildren(nextChildren, elContainer, parentComponent)
            } else {
                patchKeyedChildren(preChildren, nextChildren, elContainer, parentComponent);
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent) {
        let i = 0,
            e1 = c1.length - 1,
            e2 = c2.length - 1;

        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }

        // 左侧向右移动
        while (i <= e1 && i <= e2) {
            const n1 = c1[i],
                n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            } else {
                break;
            }
            i++;
        }
        console.log('i', i)

        // 右侧向左移动
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1],
                n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            } else {
                break;
            }
            e1--;
            e2--;
        }
        console.log(e1, e2)

        if (i > e1) {
            // 新的比旧的多
            if (i <= e2) {
                const insertNode = e2 + 1;
                const anchor = insertNode < c2.length ? c2[insertNode].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        } else if (i > e2) {
            // 新的比旧的少
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        } else {
            // 中间乱序
            let s1 = i,
                s2 = i,
                patched = 0;
            const tobePatched = e2 -s2 +1;
            const keyMap = new Map();

            const newIndexToOldIndexMap = new Array(tobePatched).fill(0);

            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                let newIndex;
                const preChild = c1[i];

                if(patched>=tobePatched){
                    hostRemove(preChild.el);
                    continue;
                }


                if (preChild.key !== null) {
                    newIndex = keyMap.get(preChild.key);
                } else {
                    console.log('no key')
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(preChild, c2[i])) {
                            newIndex = j;
                            break;
                        }
                    }
                }

                if (newIndex === undefined) {
                    hostRemove(preChild.el);
                } else {
                    // 新的位置在旧图里的位置
                    newIndexToOldIndexMap[newIndex-s2] = i + 1;
                    patch(preChild, c2[newIndex], container, parentComponent);
                    patched++;
                }
            }
            const increasingSeq = IndexOfLIS(newIndexToOldIndexMap)
            console.log(increasingSeq)

            let j = increasingSeq.length - 1;
            for (let i = tobePatched -1;i>=0;i--){

                const nextIndex = i+s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1<c2.length?c2[nextIndex+1].el:null;

                // 增加
                if(newIndexToOldIndexMap[i] === 0){
                    patch(null,nextChild,container,parentComponent,anchor);
                }
                // 插入
                if(i !== increasingSeq[j]){
                    console.log('移动位置');
                    hostInsert(nextChild.el,container,anchor)
                }else {
                    j--;
                }
            }

        }
    }

    function unMountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i].el;
            hostRemove(child);
        }
    }

    function patchElement(vnode1, vnode2, container, parentComponent) {

        const oldProps = vnode1.props || EMPTY_OBJ;
        const newProps = vnode2.props || EMPTY_OBJ;

        const el = (vnode2.el = vnode1.el);

        patchChild(vnode1, vnode2, el, parentComponent);
        // 传递的元素属性改变
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
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProps(el, key, null)
                    }
                }
            }
        }
    }

    function mountElement(vnode, container, parentComponent, anchor) {

        const el = (vnode.el = hostCreateElement(vnode.type));

        const {children, props, shapeFlags} = vnode;
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent);
        }

        for (const key in props) {
            // hasOwnProperty解决报错
            const value = props[key];
            hostPatchProps(el, key, value);
        }
        hostInsert(el, container, anchor);
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(vnode => {
            patch(null, vnode, container, parentComponent);
        });
    }

// component
    function processComponent(vnode1, vnode2, container, parentComponent) {

        mountComponent(vnode2, container, parentComponent);

    }

    function mountComponent(vnode, container, parentComponent) {

        const instance = createComponentInstance(vnode, parentComponent);

        setupComponent(instance);

        setupRenderEffect(instance, vnode, container);
    }

    function setupRenderEffect(instance, vnode, container) {

        effect(() => {
            if (!instance.isMounted) {
                const {proxy} = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));

                patch(null, subTree, container, instance);
                // 等全部subTree初始化完,赋值给vnode
                vnode.el = subTree.el;
                instance.isMounted = true;
            } else {

                const {proxy} = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;

                patch(preSubTree, subTree, container, instance);
            }
        })
    }

    return {
        createApp: createAppInterface(render)
    }
}