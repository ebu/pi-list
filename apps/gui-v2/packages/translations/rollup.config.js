import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import ts from '@wessberg/rollup-plugin-ts';

export default {
    input: './src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'commonjs',
        sourcemap: true,
        exports: 'named',
        name: 'translation',
    },
    plugins: [
        ts({
            tsconfig: 'tsconfig.json',
        }),
        commonjs(),
        resolve(),
        json(),
    ],
};
