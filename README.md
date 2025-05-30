# Pouch Vue

## This Plugin is not under active development anymore since none of the maintaining members are actively using it.

##### Basic structure copied from https://github.com/buhrmi/vue-pouch with a lot of api changes though. TypeScript support included too.

## Installation
Make sure to have `pouchdb-browser` (or `pouchdb` depending on what you need) `pouchdb-find` and `pouchdb-live-find` installed
````sh
    npm i pouchdb-browser pouchdb-live-find pouchdb-find
````

Install via npm:
```sh
    npm install --save pouch-vue
```

The only requirement is that `pouchdb-live-find` is installed:
```javascript
    import PouchDB from 'pouchdb-browser'
    import PouchFind from 'pouchdb-find'
    import PouchLiveFind from 'pouchdb-live-find'
    
    PouchDB.plugin(PouchFind)
    PouchDB.plugin(PouchLiveFind)
```

If you want to use remote databases (CouchDB, Cloudant, etc.), you should also install the authentication plugin:
```javascript
    PouchDB.plugin(require('pouchdb-authentication'));
```
Then, plug VuePouch into Vue:
```javascript
    import Vue from 'vue';
    import PouchVue from 'pouch-vue';
    
    Vue.use(PouchVue, {
      pouch: PouchDB,    // optional if `PouchDB` is available on the global object
      defaultDB: 'remoteDbName',  // this is used as a default connect/disconnect database
      optionDB: {}, // this is used to include a custom fetch() method (see TypeScript example)
      debug: '*' // optional - See `https://pouchdb.com/api.html#debug_mode` for valid settings
    });
```

### Development and Test Status

This library has recently been updated to modernize its dependencies, build system, and core codebase, adopting current JavaScript best practices and ES module standards.

**Unit Tests:** As part of this modernization, core development dependencies like Jest (to v29) and Vue Test Utils (to v2) were upgraded. Unfortunately, integrating these latest testing tools with a Vue 2 project that uses an ES Module setup (`"type": "module"` in `package.json`) has presented significant challenges. Due to these complexities, the unit tests are **currently not passing**.

While the library's runtime code is believed to be functional and benefits from the modernization, contributions to help resolve the testing incompatibilities and restore full test coverage would be highly appreciated.
### Note on PouchDB v7.0.0 Fetch Behavior

PouchDB v7.0.0 had an issue where `fetch` requests did not send credentials (e.g., cookies) by default for cross-domain requests, potentially leading to authentication errors. This was documented in [PouchDB issue #7391](https://github.com/pouchdb/pouchdb/issues/7391).

This issue was resolved in **PouchDB v7.1.1** and later versions, where `fetch` defaults were updated to include credentials, aligning with XHR behavior.

**It is recommended to use PouchDB v7.1.1 or a newer version to avoid this issue.** If you are using this plugin (`pouch-vue`), you are likely using a PouchDB version where this is no longer a concern.
```javascript
Vue.use(pouchVue,{
  pouch: PouchDB,
  defaultDB: 'todos',
  optionsDB: {
    fetch: function (url:any, opts:any) {
        opts.credentials = 'include';
        return PouchDB.fetch(url, opts);
    }
  }
})
```
## API
### $pouch

`$pouch` is made available on all vue instances and implements most of pouchdbs current API (https://pouchdb.com/api.html).
Default events are mounted on each db you connect to: https://pouchdb.com/api.html#events. When a database is created `pouchdb-db-created` is emitted and `pouchdb-db-destroyed` when it's destroyed (which you can listen to with `this.$on(EVENT_NAME)`).

#### Methods
All Methods return a promise and mirror or extend the API from pouchdb.

* `$pouch.getSession(OPTIONAL db)`: Returns the current session if already logged in to the defaultDB or given remote DB.
* `$pouch.connect(username, password, OPTIONAL db)`: Connects you to the defaultDB or given remote DB and returns the user object on success.
* `$pouch.disconnect(OPTIONAL db)`: Disconnects you from the defaultDB or given remote DB and clears the session data.
* `$pouch.createUser(name, password, OPTIONAL db)`: Creates a user in the defaultDB or given remote DB and starts a new session.
* `$pouch.putUser(name, OPTIONAL metadata, OPTIONAL db)`: Update a user in the defaultDB or given remote DB and returns the user object on success. [pouchdb-authentication API : putUser](https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/api.md#dbputuserusername-opts--callback)
* `$pouch.deleteUser(name, OPTIONAL db)`: Delete a user in the defaultDB or given remote DB and returns response. [pouchdb-authentication API : deleteUser](https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/api.md#dbdeleteuserusername-opts--callback)
* `$pouch.signUpAdmin(adminUsername, adminPassword, OPTIONAL db)`: Sign up a new admin and returns response. [pouchdb-authentication API : signUpAdmin](https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/api.md#dbsignupadminusername-password--options--callback)
* `$pouch.deleteAdmin(name, OPTIONAL db)`:Delete an admin and returns response. [pouchdb-authentication API : deleteAdmin](https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/api.md#dbdeleteadminusername-opts--callback)
___
* `$pouch.destroy(OPTIONAL db)`: same as https://pouchdb.com/api.html#delete_database
* `$pouch.defaults(options)`: same as https://pouchdb.com/api.html#defaults
___
* `$pouch.sync(localDatabase, OPTIONAL remoteDatabase, OPTIONAL options)`: The optional remoteDatabase parameter will use the default db set in the pouch options initially. Basically the same as PouchDB.sync(local, remote, {live: true, retry: true}). Also, if the browser has an active session cookie, it will fetch session data (username, etc) from the remote server. **BONUS:** If your remote database runs CouchDB 2.0 or higher, you can also specify a Mango Selector that is used to filter documents coming from the remote server. Callback functions will be invoked with the name `pouchdb-[method]-[type]`. So in this case you can use `this.$on('pouchdb-sync-change', callback(data))` to listen when a change occurs. See https://pouchdb.com/api.html#sync for a full list of events you can use.

**default options (will be merged with the options passed in)**:
 ```javascript
{
    live: true,
    retry: true,
    back_off_function: (delay) => {
        if (delay === 0) {
            return 1000;
        }
        return delay * 3;
    },
}
```
**For example:**
```javascript
    $pouch.sync('complaints', 'https:/42.233.1.44/complaints', {
        selector: {
            type: 'complaint',
            assignee: this.session.name
        }
      });

```
* `$pouch.push(localDatabase, OPTIONAL remoteDatabase, OPTIONAL options)`: The optional remoteDatabase parameter will use the default db set in the pouch options initially. Like https://pouchdb.com/api.html#replication - replicate-to. Also, if the browser has an active session cookie, it will fetch session data (username, etc) from the remote server.
* `$pouch.pull(localDatabase, OPTIONAL remoteDatabase, OPTIONAL options)`: The optional remoteDatabase parameter will use the default db set in the pouch options initially. Like https://pouchdb.com/api.html#replication - replicate-from. Also, if the browser has an active session cookie, it will fetch session data (username, etc) from the remote server.
* `$pouch.changes(OPTIONAL options, OPTIONAL db)`: Listens for change on a db like: https://pouchdb.com/api.html#changes
* `$pouch.put(object, OPTIONAL options, OPTIONAL db)`: https://pouchdb.com/api.html#create_document
* `$pouch.post(object, OPTIONAL options, OPTIONAL db)`: https://pouchdb.com/api.html#create_document
* `$pouch.remove(id, rev, OPTIONAL db)`: https://pouchdb.com/api.html#delete_document
* `$pouch.get(object, OPTIONAL options, OPTIONAL db)`: https://pouchdb.com/api.html#create_document
* `$pouch.query('map/reduce function', OPTIONAL options, OPTIONAL db)`: like https://pouchdb.com/api.html#query_database
* `$pouch.allDocs(OPTIONAL options, OPTIONAL db)`: like https://pouchdb.com/api.html#batch_fetch but `include_docs` is set to true by default. You can however overwrite it of course.
* `$pouch.bulkDocs(docs, OPTIONAL options, OPTIONAL db)`: https://pouchdb.com/api.html#batch_create
* `$pouch.compact(OPTIONAL options, OPTIONAL db)`: https://pouchdb.com/api.html#compaction
* `$pouch.viewCleanup(OPTIONAL db)`: https://pouchdb.com/api.html#view_cleanup
* `$pouch.info(OPTIONAL db)`: like https://pouchdb.com/api.html#database_information
* `$pouch.find(request, OPTIONAL db)`: like https://pouchdb.com/api.html#query_index
* `$pouch.createIndex(index, OPTIONAL db)`: like https://pouchdb.com/api.html#create_index
* `$pouch.putAttachment(docId, [rev], attachmentObject(id,data,type), OPTIONAL db)`: like https://pouchdb.com/api.html#save_attachment
* `$pouch.getAttachment(docId, attachmentId, OPTIONAL db)`: like https://pouchdb.com/api.html#get_attachment
* `$pouch.deleteAttachment(docId, attachmentId, docRev, OPTIONAL db)`: like https://pouchdb.com/api.html#delete_attachment
* `$pouch.close(OPTIONAL db)`: https://pouchdb.com/api.html#close_database

#### Non-Reactive Properties
* `vm.$databases`: the pouchdb instances which are shared across all components.

## Examples

```vue
<template>
  <div class="todos">
    <input v-model="message" placeholder="New Todo">
    <button @click="$pouch.post({message: message},{},'todos');message=''">Save Todo</button>
    <div v-for="todo in todos">
      <input v-model="todo.message" @change="$pouch.put(todo,{},'todos')">
      <button @click="$pouch.remove(todo,{},'todos')">Remove</button>
    </div>
  </div>
</template>

<script>
  export default {
    // VuePouch adds a `pouch` config option to all components.
    pouch: {
      // The simplest usage. queries all documents from the "todos" pouch database and assigns them to the "todos" vue property.
      todos: {/*empty selector*/}
    },
    created: function() {
      // Send all documents to the remote database, and stream changes in real-time. Note if you use filters you need to set them correctly for pouchdb and couchdb. You can set them for each direction separatly: options.push/options.pull. PouchDB might not need the same filter to push documents as couchdb to send the filtered requested documents.
      this.$pouch.sync('todos', 'http://localhost:5984/todos', options);
    }
  }
</script>
```

### Reactive & Live Selectors (Mango Queries)

```vue
<template>
  Show people that are <input v-model="age"> years old.
  <div v-for="person in people">
    {{ person.name }}
  </div>
</template>

<script>
  export default {
    data () {
      return {
        resultsPerPage: 25,
        currentPage: 1
      }
    },
    // Use the pouch property to configure the component to (reactively) read data from pouchdb.
    pouch: {
      // The function returns a Mango-like selector that is run against the `people` database.
      // The result of the query is assigned to the `people` property.
      people() {
        if (!this.age) return;
        return {age: this.age, type: "person"}
      },
      // You can also specify the database dynamically (local or remote), as well as limits, skip and sort order:
      peopleInOtherDatabase() {
        return {
          database: this.selectedDatabase, // you can pass a database string or a pouchdb instance
          selector: {type: "person"},
          sort: [{name: "asc"}],
          limit: this.resultsPerPage,
          skip: this.resultsPerPage * (this.currentPage - 1)
        }
      }
    }
  })
</script>
```

### Single documents

If you only want to sync a single document that matches a selector, use `first: true`:

```javascript
module.exports = {
  // ...
  pouch: {
    projectDetails() {
      return {
        database: 'mydatabase',
        selector: {_id: this.selectedProjectId},
        first: true
      }
    }
  }
  // ...
}
```

### TypeScript
TypeScript example with a TypeScript file to include the pouch-vue plugin and a Single File Component
using the plugin.

main.ts
```typescript

import { Component, Vue } from 'vue-property-decorator';
import PouchDB from 'pouchdb-browser';
import lf from 'pouchdb-find';
import plf from 'pouchdb-live-find';
import auth from 'pouchdb-authentication';

import pouchVue from 'pouch-vue';

// PouchDB plugins: pouchdb-find (included in the monorepo) and LiveFind (external plugin)
PouchDB.plugin(lf);
PouchDB.plugin(plf);
PouchDB.plugin(auth);

Vue.use(pouchVue,{
  pouch: PouchDB,
  defaultDB: 'todos',
  optionsDB: {
    fetch: function (url:any, opts:any) {
        opts.credentials = 'include';
        return PouchDB.fetch(url, opts);
    }
  }
})

new Vue({});

```
Todos.vue
```vue
<template>
  <div class="todos">
    <input v-model="message" placeholder="New Todo">
    <button @click="$pouch.post({message: message},{},'todos');message=''">Save Todo</button>
    <div v-for="todo in todos">
      <input v-model="todo.message" @change="$pouch.put(todo,{},'todos')">
      <button @click="$pouch.remove(todo,{},'todos')">Remove</button>
    </div>
  </div>
</template>

<script lang="ts">

@Component({
  pouch: {
  // The simplest usage. queries all documents from the "todos" pouch database and assigns them to the "todos" vue property.
      todos: {/*empty selector*/}
  }
})
export default class Todos extends Vue {
  // Lifecycle hooks
  created () { // Send all documents to the remote database, and stream changes in real-time
      this.$pouch.sync('todos', 'http://localhost:5984/todos');
  }
  // mounted () { },
  // updated () { },
  // destroyed () { }
}
</script>

```

### User Authentication

```javascript
 this.$pouch.connect(this.credentials.username, this.credentials.password)
    .then((res) => {
        let isUnauthorized = res.error === 'unauthorized',
            isOffline = res.status === 0;

                if (isOffline) {
                    return;
                }

                if (isUnauthorized) {
                    return;
                }
                this.$router.push('/dashboard');
    })
    .catch((error) => {
        console.error(error);
    });
```

### Handle Sessions
```javascript
this.$pouch.getSession().then((data) => {
    if (data.status === 0) {
        this.$router.push('/login');
            console.log('most likely offline');
            return;
        }

        if (!data.user || !data.hasAccess) {
            this.$router.push('/login');
            return;
        }

        this.$store.commit('UPDATE_SESSION', data);
});
```
