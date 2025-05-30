// tests/jest.setup.js
import Vue from 'vue/dist/vue.runtime.common.js';
global.Vue = Vue; // Expose Vue 2 globally for @vue/test-utils

// Add console.log for Vue version as per subtask suggestion
console.log('Vue version in jest.setup.js:', Vue.version);

// Ensure PouchDB plugins are registered
import PouchDB from 'pouchdb-node';
import lf from 'pouchdb-find';
import plf from 'pouchdb-live-find';
import auth from 'pouchdb-authentication';

PouchDB.plugin(lf);
PouchDB.plugin(plf);
PouchDB.plugin(auth);
global.PouchDB = PouchDB;

// Fetch polyfill (if needed by other tests, was in global-mocks.js)
import fetchPolyfill from 'node-fetch';
if (!global.fetch) {
  global.fetch = fetchPolyfill;
  global.Request = fetchPolyfill.Request;
  global.Headers = fetchPolyfill.Headers;
  global.Response = fetchPolyfill.Response;
}
// Note: The @vue/server-renderer mock is handled by moduleNameMapper in jest.config.cjs
