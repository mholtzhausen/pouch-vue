// PouchDB and plugins are registered in global-mocks.js
// No need for local PouchDB.plugin calls here.
import PouchDB from 'pouchdb-node'; // Still need PouchDB constructor for plugin options
import PouchVue from '../src/index';

// vue-test-utils
import { mount } from '@vue/test-utils'; // createLocalVue removed

// import test vue single file components
import emptyDataFunction from './emptyDataFunction.vue';
import emptyDataObject from './emptyDataObject.vue';
import noData from './noDataFunctionOrObject.vue';
import existingData from './ExistingTodosDataFunction.vue';
import todosDataWithSelector from './TodosDataFunctionWithSelector.vue';

describe('Pouch options are returned by function', () => {
    describe('Unit Tests that todos is defined on Vue components', () => {
        const testDatum = [ // const instead of var
            { name: 'Test Plugin with Empty Data Function', component: emptyDataFunction },
            { name: 'Test Plugin with Empty Data Object', component: emptyDataObject },
            { name: 'Test Plugin with No Data Function Or Object', component: noData },
            { name: 'Test Plugin with Existing Data Function', component: existingData },
        ];

        testDatum.forEach(datum => { // Modern loop
            const { component: tryTestData, name: tryTestName } = datum; // Destructuring

            test(tryTestName, () => { // Arrow function for test
                // createLocalVue and localVue.use removed
                const wrapper = mount(tryTestData, {
                    global: { // New way to install plugins
                        plugins: [[PouchVue, { pouch: PouchDB, defaultDB: 'farfromhere' }]],
                    },
                    pouch() { // Custom option for the component
                        return {
                            todos: {/*empty selector*/ },
                        };
                    },
                });
                expect(wrapper.vm.$data.todos).not.toBeUndefined();
            });
        });
    });

    describe('Unit Tests to see that the todos property on the data root level is connected with the todos property on the vue instance', () => {
        const testDatum = [
            { name: 'Test Plugin with Empty Data Function', component: emptyDataFunction },
            { name: 'Test Plugin with Empty Data Object', component: emptyDataObject },
            { name: 'Test Plugin with No Data Function Or Object', component: noData },
            { name: 'Test Plugin with Existing Data Function', component: existingData },
        ];

        testDatum.forEach(datum => {
            const { component: tryTestData, name: tryTestName } = datum;
            test(tryTestName, () => {
                const wrapper = mount(tryTestData, {
                    global: {
                        plugins: [[PouchVue, { pouch: PouchDB, defaultDB: 'farfromhere' }]],
                    },
                    pouch() {
                        return {
                            todos: {/*empty selector*/ },
                        };
                    },
                });
                wrapper.vm.todos = ['north', 'east', 'south', 'west'];
                expect(wrapper.vm.$data.todos).toBe(wrapper.vm.todos);
            });
        });
    });
});

describe('Pouch options are objects', () => {
    describe('Unit Tests that todos is defined on Vue components', () => {
        const testDatum = [
            { name: 'Test Plugin with Empty Data Function', component: emptyDataFunction },
            { name: 'Test Plugin with Empty Data Object', component: emptyDataObject },
            { name: 'Test Plugin with No Data Function Or Object', component: noData },
            { name: 'Test Plugin with Existing Data Function', component: existingData },
        ];
        testDatum.forEach(datum => {
            const { component: tryTestData, name: tryTestName } = datum;
            test(tryTestName, () => {
                const wrapper = mount(tryTestData, {
                    global: {
                        plugins: [[PouchVue, { pouch: PouchDB, defaultDB: 'farfromhere' }]],
                    },
                    pouch: { // Custom option as object
                        todos: {/*empty selector*/ },
                    },
                });
                expect(wrapper.vm.$data.todos).not.toBeUndefined();
            });
        });
    });

    describe('Unit Tests to see that the todos property on the data root level is connected with the todos property on the vue instance', () => {
        const testDatum = [
            { name: 'Test Plugin with Empty Data Function', component: emptyDataFunction },
            { name: 'Test Plugin with Empty Data Object', component: emptyDataObject },
            { name: 'Test Plugin with No Data Function Or Object', component: noData },
            { name: 'Test Plugin with Existing Data Function', component: existingData },
        ];
        testDatum.forEach(datum => {
            const { component: tryTestData, name: tryTestName } = datum;
            test(tryTestName, () => {
                const wrapper = mount(tryTestData, {
                    global: {
                        plugins: [[PouchVue, { pouch: PouchDB, defaultDB: 'farfromhere' }]],
                    },
                    pouch: {
                        todos: {/*empty selector*/ },
                    },
                });
                wrapper.vm.todos = ['north', 'east', 'south', 'west'];
                expect(wrapper.vm.$data.todos).toBe(wrapper.vm.todos);
            });
        });
    });
});

describe('Set selector to null', () => {
    const testDatum = [ // const
        { name: 'Test Plugin with Reactive Selector that can return null', component: todosDataWithSelector },
    ];

    testDatum.forEach(datum => { // Modern loop
        const { component: tryTestData, name: tryTestName } = datum;

        const selector = function() { // selector function remains, 'this' context is important for component
            return (this.age < this.maxAge) ? null : {};
        };

        test(tryTestName, async () => { // async test function
            // createLocalVue and localVue.use removed
            const wrapper = mount(tryTestData, {
                global: { // New way to install plugins
                    plugins: [[PouchVue, { pouch: PouchDB, defaultDB: 'farfromhere' }]],
                },
                pouch: { // Custom option
                    todos: selector, // 'this' in selector will refer to component vm
                },
            });

            wrapper.vm.todos = ['north', 'east', 'south', 'west']; // Initialize if needed by component logic
            wrapper.vm.maxAge = 50; // Initialize if needed by component logic
          
            await wrapper.vm.$nextTick(); // await $nextTick
            expect(wrapper.emitted('pouchdb-livefeed-error')).toHaveLength(1);
            // done() removed
        });
    });
});
