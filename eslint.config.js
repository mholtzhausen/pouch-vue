// eslint.config.js
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/recommended'], // Using flat config for Vue
    {
        languageOptions: {
            ecmaVersion: 2022, // Updated for JSON import assertions and modern JS
            sourceType: 'module',
            globals: {
                ...globals.browser,
                'PouchDB': 'readonly',
            },
        },
        rules: {
            // Translated rules from .eslintrc
            // 'indent': ['error', 4, { 'SwitchCase': 1 }], // Base indent rule turned off, handled per file type
            'quotes': ['error', 'single', { 'avoidEscape': true }],
            'brace-style': ['error', '1tbs'],
            'comma-dangle': ['error', 'always-multiline'],
            'consistent-return': 'error',
            'linebreak-style': ['error', 'unix'],
            'semi': ['error', 'always'],
            'no-console': 'off',
            'no-undef': 'error', // Changed from off to error, will rely on globals declaration
            'no-shadow': 'warn', // Changed from off to warn
            'no-bitwise': 'error',
            'eol-last': 'error',
            'dot-notation': 'error',
            'dot-location': ['error', 'property'],
            'eqeqeq': ['error', 'allow-null'],
            'no-inner-declarations': ['error', 'functions'],
            'no-multi-spaces': 'error',
            'no-unused-expressions': 'error',
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Changed from off to warn, ignore args starting with _
            'keyword-spacing': 'error',
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', {'anonymous': 'never', 'named': 'never'}],
            'strict': ['error', 'global'], // This might be an issue with ES modules.
        },
    // Apply these rules specifically to .js and .mjs files if needed,
    // or define overrides for .vue files if Vue plugin handles them differently.
    },
    {
    // Specific overrides for Vue files, if plugin:vue/recommended doesn't cover everything
    // This is also where vue-eslint-parser would be implicitly configured by pluginVue
        files: ['**/*.vue'],
        // languageOptions: {
        //   parser: pluginVue.parser, // Not usually needed explicitly with flat/recommended
        // },
        rules: {
            'indent': 'off', // Turn off base indent rule for Vue files, rely on vue/script-indent
            'vue/html-indent': ['error', 4],
            'vue/script-indent': ['error', 4, { 'baseIndent': 1, 'switchCase': 1 }],
            'vue/valid-template-root': 'off', // For test SFCs that might be fragments
        },
    },
    {
        // Configuration for JavaScript/module JavaScript files (main code)
        files: ['src/**/*.js', 'rollup.config.mjs'], // Be specific
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
        rules: {
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            // other JS specific rules if any
        },
    },
    {
        // Configuration for test files
        files: ['tests/**/*.js', 'tests/**/*.spec.js'],
        languageOptions: {
            globals: {
                ...globals.node, // Add Node.js globals
                'describe': 'readonly',
                'test': 'readonly',
                'it': 'readonly', // Common alias for test
                'expect': 'readonly',
                'jest': 'readonly', // jest object itself
                'beforeEach': 'readonly',
                'afterEach': 'readonly',
                'beforeAll': 'readonly',
                'afterAll': 'readonly',
            },
        },
        rules: {
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            // specific rules for tests if needed
        },
    },
    {
        ignores: ['lib/', 'node_modules/', 'dist/', 'coverage/'],
    },
];
