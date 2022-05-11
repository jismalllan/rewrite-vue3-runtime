import {getCurrentInstance} from "./component";


export function provide(key, value) {
    const instance: any = getCurrentInstance()

    if (instance) {
        const {provides} = instance;

        provides[key] = value;
    }

}

export function inject(key, defaultValue) {

    const instance: any = getCurrentInstance();

    if (instance) {

        const provides = instance.parent.provides;

        if (key in provides) {
            return provides[key];
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }

    }
}