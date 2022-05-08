import typescript from '@rollup/plugin-typescript'
import pack from './package.json'

export default {
    input:'./src/index.ts',
    output:[
        {
            format:'cjs',
            file:pack.main
        },
        {
            format:'es',
            file:pack.module
        }
    ],
    plugins:[
        typescript()
    ]
}