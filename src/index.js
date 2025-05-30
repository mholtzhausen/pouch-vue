import { isRemote } from 'pouchdb-utils';

// Step 1 & 2: Removed IIFE, vars to let/const
let vueInstance = null; // Renamed 'vue' to 'vueInstance' to avoid conflict with Vue import if ever needed by name
let pouchDbInstance = null; // Renamed 'pouch' to 'pouchDbInstance'
let globalDefaultDB = null; // Renamed 'defaultDB'
let globalDefaultUsername = null; // Renamed 'defaultUsername'
let globalDefaultPassword = null; // Renamed 'defaultPassword'
const databases = {};
let globalOptionsDB = {}; // Renamed 'optionsDB'

const vuePouchMixin = { // Renamed 'vuePouch'
    data(vm) {
        let pouchOptions = vm.$options.pouch;
        if (typeof pouchOptions === 'undefined' || pouchOptions === null) return {};
        if (typeof pouchOptions === 'function') pouchOptions = pouchOptions.call(vm); // Ensure context
        return Object.keys(pouchOptions).reduce((accumulator, currentValue) => {
            accumulator[currentValue] = null;
            return accumulator;
        }, {});
    },

    created() {
        if (!vueInstance) {
            console.warn('pouch-vue not installed!');
            return;
        }

        const vm = this;
        vm._liveFeeds = {};

        if (globalDefaultDB) {
            makeInstance(globalDefaultDB);
        }

        function fetchSession(db = databases[globalDefaultDB]) {
            return db.getSession()
                .then(session => db.getUser(session.userCtx.name)
                    .then(userData => ({
                        user: { ...session.userCtx, ...userData },
                        hasAccess: true,
                    })),
                );
            // Step 3: Improved error handling (let it propagate or be caught by caller)
        }

        function login(db = databases[globalDefaultDB]) {
            return db.logIn(globalDefaultUsername, globalDefaultPassword)
                .then(user => db.getUser(user.name)
                    .then(userData => ({
                        user: { ...user, ...userData },
                        hasAccess: true,
                    })),
                );
            // Step 3: Improved error handling
        }

        function makeInstance(dbName, options = {}) { // Renamed 'db' to 'dbName' for clarity
            const _options = { ...globalOptionsDB, ...options }; // Use spread for merging
            databases[dbName] = new pouchDbInstance(dbName, _options);
            registerListeners(databases[dbName]);
        }

        function registerListeners(dbInstance) { // Renamed 'db' to 'dbInstance'
            dbInstance.on('created', name => {
                vm.$emit('pouchdb-db-created', { db: name, ok: true });
            });
            dbInstance.on('destroyed', name => {
                vm.$emit('pouchdb-db-destroyed', { db: name, ok: true });
            });
        }

        const $pouch = {
            version: '__VERSION__',
            connect(username, password, dbName = globalDefaultDB) { // Renamed 'db' to 'dbName'
                if (!databases[dbName]) makeInstance(dbName);
                globalDefaultUsername = username;
                globalDefaultPassword = password;

                if (!isRemote(databases[dbName])) {
                    return Promise.resolve({ // Still resolve for non-remote, as it's not an "error" but a state
                        message: 'database is not remote',
                        error: 'bad request',
                        status: 400,
                    });
                }
                return login(databases[dbName]);
            },
            createUser(username, password, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].signUp(username, password)
                    .then(() => vm.$pouch.connect(username, password, dbName))
                    .catch(error => Promise.reject(error)); // Step 3
            },
            putUser(username, metadata = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].putUser(username, { metadata })
                    .catch(error => Promise.reject(error)); // Step 3
            },
            deleteUser(username, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].deleteUser(username)
                    .catch(error => Promise.reject(error)); // Step 3
            },
            changePassword(username, password, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].changePassword(username, password)
                    .catch(error => Promise.reject(error)); // Step 3
            },
            changeUsername(oldUsername, newUsername, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].changeUsername(oldUsername, newUsername)
                    .catch(error => Promise.reject(error)); // Step 3
            },
            signUpAdmin(adminUsername, adminPassword, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].signUpAdmin(adminUsername, adminPassword)
                    .catch(error => Promise.reject(error)); // Step 3
            },
            deleteAdmin(adminUsername, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].deleteAdmin(adminUsername)
                    .catch(error => Promise.reject(error)); // Step 3
            },
            disconnect(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                globalDefaultUsername = null;
                globalDefaultPassword = null;

                if (!isRemote(databases[dbName])) {
                    return Promise.resolve({ // Still resolve for non-remote
                        message: 'database is not remote',
                        error: 'bad request',
                        status: 400,
                    });
                }
                return databases[dbName].logOut()
                    .then(res => ({
                        ok: res.ok,
                        user: null,
                        hasAccess: false,
                    }))
                    .catch(error => Promise.reject(error)); // Step 3
            },
            destroy(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].destroy().then(() => {
                    if (dbName !== globalDefaultDB) delete databases[dbName];
                });
            },
            defaults(options = {}) {
                pouchDbInstance.defaults(options);
            },
            close(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].close().then(() => {
                    if (dbName !== globalDefaultDB) delete databases[dbName];
                });
            },
            getSession(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                if (!isRemote(databases[dbName])) {
                    return Promise.resolve({ // Still resolve for non-remote
                        message: 'database is not remote',
                        error: 'bad request',
                        status: 400,
                    });
                }
                return fetchSession(databases[dbName]);
            },
            sync(localDBName, remoteDBName = globalDefaultDB, options = {}) { // Renamed params
                if (!databases[localDBName]) makeInstance(localDBName);
                if (!databases[remoteDBName]) makeInstance(remoteDBName);
                if (!globalDefaultDB) globalDefaultDB = remoteDBName;

                const _options = {
                    live: true,
                    retry: true,
                    back_off_function: delay => (delay === 0 ? 1000 : delay * 3),
                    ...options,
                };
                const syncHandle = pouchDbInstance.sync(databases[localDBName], databases[remoteDBName], _options);
                syncHandle.on('paused', err => vm.$emit(err ? 'pouchdb-sync-error' : 'pouchdb-sync-paused', { db: localDBName, error: err, paused: !err }));
                syncHandle.on('change', info => vm.$emit('pouchdb-sync-change', { db: localDBName, info }));
                syncHandle.on('active', () => vm.$emit('pouchdb-sync-active', { db: localDBName, active: true }));
                syncHandle.on('denied', err => vm.$emit('pouchdb-sync-denied', { db: localDBName, error: err }));
                syncHandle.on('complete', info => vm.$emit('pouchdb-sync-complete', { db: localDBName, info }));
                syncHandle.on('error', err => vm.$emit('pouchdb-sync-error', { db: localDBName, error: err }));
                return syncHandle;
            },
            push(localDBName, remoteDBName = globalDefaultDB, options = {}) {
                if (!databases[localDBName]) makeInstance(localDBName);
                if (!databases[remoteDBName]) makeInstance(remoteDBName);
                if (!globalDefaultDB) globalDefaultDB = remoteDBName;

                const _options = { ...options };
                const rep = databases[localDBName].replicate.to(databases[remoteDBName], _options);
                rep.on('paused', err => vm.$emit(err ? 'pouchdb-push-error' : 'pouchdb-push-paused', { db: localDBName, error: err, paused: !err }));
                rep.on('change', info => vm.$emit('pouchdb-push-change', { db: localDBName, info }));
                rep.on('active', () => vm.$emit('pouchdb-push-active', { db: localDBName, active: true }));
                rep.on('denied', err => vm.$emit('pouchdb-push-denied', { db: localDBName, error: err }));
                rep.on('complete', info => vm.$emit('pouchdb-push-complete', { db: localDBName, info }));
                rep.on('error', err => vm.$emit('pouchdb-push-error', { db: localDBName, error: err }));
                return rep;
            },
            pull(localDBName, remoteDBName = globalDefaultDB, options = {}) {
                if (!databases[localDBName]) makeInstance(localDBName);
                if (!databases[remoteDBName]) makeInstance(remoteDBName);
                if (!globalDefaultDB) globalDefaultDB = remoteDBName;
                const _options = { ...options };
                const rep = databases[localDBName].replicate.from(databases[remoteDBName], _options);
                rep.on('paused', err => vm.$emit(err ? 'pouchdb-pull-error' : 'pouchdb-pull-paused', { db: localDBName, error: err, paused: !err }));
                rep.on('change', info => vm.$emit('pouchdb-pull-change', { db: localDBName, info }));
                rep.on('active', () => vm.$emit('pouchdb-pull-active', { db: localDBName, active: true }));
                rep.on('denied', err => vm.$emit('pouchdb-pull-denied', { db: localDBName, error: err }));
                rep.on('complete', info => vm.$emit('pouchdb-pull-complete', { db: localDBName, info }));
                rep.on('error', err => vm.$emit('pouchdb-pull-error', { db: localDBName, error: err }));
                return rep;
            },
            changes(options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                const _options = {
                    live: true,
                    retry: true,
                    back_off_function: delay => (delay === 0 ? 1000 : delay * 3),
                    ...options,
                };
                const changesHandle = databases[dbName].changes(_options);
                changesHandle.on('change', info => vm.$emit('pouchdb-changes-change', { db: dbName, info }));
                changesHandle.on('complete', info => vm.$emit('pouchdb-changes-complete', { db: dbName, info }));
                changesHandle.on('error', err => vm.$emit('pouchdb-changes-error', { db: dbName, error: err }));
                return changesHandle;
            },
            get(object, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].get(object, options);
            },
            put(object, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].put(object, options);
            },
            post(object, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].post(object, options);
            },
            remove(object, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].remove(object, options);
            },
            query(fun, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].query(fun, options);
            },
            find(options, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].find(options);
            },
            createIndex(index, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].createIndex(index);
            },
            allDocs(options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                const _options = { include_docs: true, ...options };
                return databases[dbName].allDocs(_options);
            },
            bulkDocs(docs, options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].bulkDocs(docs, options);
            },
            compact(options = {}, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].compact(options);
            },
            viewCleanup(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].viewCleanup();
            },
            info(dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].info();
            },
            putAttachment(docId, rev, attachment, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].putAttachment(docId, attachment.id, rev ? rev : null, attachment.data, attachment.type);
            },
            getAttachment(docId, attachmentId, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].getAttachment(docId, attachmentId);
            },
            deleteAttachment(docId, attachmentId, docRev, dbName = globalDefaultDB) {
                if (!databases[dbName]) makeInstance(dbName);
                return databases[dbName].removeAttachment(docId, attachmentId, docRev);
            },
        };

        vm.$pouch = $pouch;
        vm.$databases = databases;

        let pouchOptions = vm.$options.pouch;
        if (!pouchOptions) return;
        if (typeof pouchOptions === 'function') pouchOptions = pouchOptions.call(vm);

        Object.keys(pouchOptions).forEach(key => {
            let pouchFn = pouchOptions[key];
            if (typeof pouchFn !== 'function') {
                const staticConfig = pouchOptions[key];
                pouchFn = () => staticConfig;
            }

            vm.$watch(
                () => pouchFn.call(vm), 
                config => {
                    if (!config) {
                        vm.$emit('pouchdb-livefeed-error', { db: key, config, error: 'Null or undefined selector' });
                        return;
                    }

                    const { selector: sel, sort, skip, limit, first, database: dbOption } = config;
                    const currentSelector = config.selector ? sel : config;

                    const databaseParam = dbOption || key;
                    let dbInstance = null;

                    if (typeof databaseParam === 'object' && databaseParam instanceof pouchDbInstance) {
                        dbInstance = databaseParam;
                    } else if (typeof databaseParam === 'string') {
                        if (!databases[databaseParam]) makeInstance(databaseParam);
                        dbInstance = databases[databaseParam];
                    }

                    if (!dbInstance) {
                        vm.$emit('pouchdb-livefeed-error', { db: key, error: 'Null or undefined database or not a PouchDB instance' });
                        return;
                    }

                    if (vm._liveFeeds[key]) vm._liveFeeds[key].cancel();
                    
                    let aggregateCache = [];

                    vm._liveFeeds[key] = dbInstance.liveFind({
                        selector: currentSelector,
                        sort,
                        skip,
                        limit,
                        aggregate: true,
                    })
                        .on('update', (update, aggregate) => {
                            const finalAggregate = first && aggregate && aggregate.length > 0 ? aggregate[0] : aggregate;
                            vm[key] = aggregateCache = finalAggregate;
                            vm.$emit('pouchdb-livefeed-update', { db: key, name: dbInstance.name });
                        })
                        .on('ready', () => {
                            vm[key] = aggregateCache;
                            vm.$emit('pouchdb-livefeed-ready', { db: key, name: dbInstance.name });
                        })
                        .on('cancelled', () => {
                            vm.$emit('pouchdb-livefeed-cancel', { db: key, name: dbInstance.name });
                        })
                        .on('error', err => {
                            vm.$emit('pouchdb-livefeed-error', { db: key, name: dbInstance.name, error: err });
                        });
                },
                { immediate: true },
            );
        });
    },
    beforeDestroy() {
        Object.keys(this._liveFeeds).forEach(lfKey => {
            this._liveFeeds[lfKey].cancel();
        });
    },
};

const pluginApi = {
    install: (Vue, options = {}) => {
        vueInstance = Vue;

        const PouchDBGlobal = (typeof window !== 'undefined' && window.PouchDB) ? window.PouchDB : null;
        let pouchInstanceToUse = options.pouch || PouchDBGlobal;
        
        ({ 
            pouch: pouchDbInstance = pouchInstanceToUse,
            defaultDB: globalDefaultDB = '', 
            optionsDB: globalOptionsDB = {}, 
        } = options);

        // If options.pouch was explicitly passed (even as null/undefined), it takes precedence.
        // If not, then global PouchDB is used. If options.pouch is set, it's already in pouchDbInstance.
        // The complex destructuring above handles this, but ensure pouchDbInstance is correctly assigned.
        if (Object.prototype.hasOwnProperty.call(options, 'pouch')) {
            pouchDbInstance = options.pouch;
        } else {
            pouchDbInstance = PouchDBGlobal;
        }
        
        if (!pouchDbInstance) {
            console.error("PouchDB is not available. Please pass it as an option (e.g., options.pouch = PouchDB) or ensure it's available globally (window.PouchDB).");
            return;
        }

        if (options.debug === '*' && pouchDbInstance.debug && typeof pouchDbInstance.debug.enable === 'function') {
            pouchDbInstance.debug.enable('*');
        } else if (options.debug === '*' && (!pouchDbInstance.debug || typeof pouchDbInstance.debug.enable !== 'function')) {
            console.warn("PouchDB debug enabling was requested, but 'PouchDB.debug.enable' is not available on the PouchDB instance.");
        }
        
        Vue.mixin(vuePouchMixin);
    },
};

export default pluginApi;
