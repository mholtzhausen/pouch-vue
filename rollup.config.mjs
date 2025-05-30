import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import replace from 'rollup-plugin-replace';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default {
    input: './src/index.js',
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: 'pouchVue',
            banner: `
/**
 * pouch vue v${pkg.version}
 * (c) ${new Date().getFullYear()} Simon Kunz
 * @license MIT
 */
`.replace(/ {4}/gm, '').trim(),
        },
    ],
    plugins: [
        json(),
        resolve(),
        commonjs(),
        nodePolyfills(),
        buble({ objectAssign: 'Object.assign' }),
        replace({ __VERSION__: pkg.version }),
    ],
};
