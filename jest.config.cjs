// jest.config.cjs
module.exports = {
  verbose: true,
  // setupFiles: [], // global-mocks.js content is merged into jest.setup.js
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testEnvironment: "jsdom",
  moduleFileExtensions: [
    "js",
    "vue"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    '^vue$': 'vue/dist/vue.runtime.common.js',
    '^vue/dist/(.*)$': 'vue/dist/$1', 
    '@vue/server-renderer': '<rootDir>/tests/__mocks__/@vue/server-renderer.cjs'
  },
  transform: {
    "^.+\\.js$": "babel-jest",
    ".*\\.(vue)$": "@vue/vue2-jest"
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(vue|node-fetch|uuid|pouchdb-find|pouchdb-utils|pouchdb-live-find|pouchdb-authentication|pouchdb-selector-core|@vue/compiler-dom|@vue/compiler-core)/)',
  ],
};
