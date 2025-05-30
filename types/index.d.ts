/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-mapreduce" />
/// <reference types="pouchdb-replication" />
/// <reference types="pouchdb-authentication" />
/// <reference types="pouchdb-live-find" />

import _Vue, { PluginObject } from 'vue'; // Changed to PluginObject

declare namespace PouchDB {
  type PouchDBConstructor = new (name?: string, options?: PouchDB.Configuration.DatabaseConfiguration) => PouchDB.Database;
}

export interface PouchVuePluginOptions {
  pouch: PouchDB.PouchDBConstructor;
  defaultDB?: string;
  optionsDB?: PouchDB.Configuration.DatabaseConfiguration;
  debug?: string;
}

export interface PouchDBInstanceDocument<Content extends {} = {}> extends PouchDB.Core.Document<Content> { }
export interface PouchDBInstanceResponse extends PouchDB.Core.Response { }
export interface PouchDBInstanceError extends PouchDB.Core.Error { }

export interface PouchVueReactiveProperty {
  selector: PouchDB.Find.FindRequest<{}> | object;
  sort?: PouchDB.Find.SortOrder[];
  skip?: number;
  limit?: number;
  first?: boolean;
  database?: string | PouchDB.Database<{}>;
}

export type ComponentPouchOptionValue = PouchDB.Find.FindRequest<{}> | PouchVueReactiveProperty | object;
export type ComponentPouchOptions = Record<string, ComponentPouchOptionValue | (() => ComponentPouchOptionValue)>;

export interface PouchVueAPI {
  version: string;

  connect(username: string, password?: string, dbName?: string): Promise<any>;
  createUser(username: string, password?: string, dbName?: string): Promise<any>;
  putUser(username: string, metadata?: object, dbName?: string): Promise<PouchDB.Core.Response | PouchDB.Core.Error>;
  deleteUser(username: string, dbName?: string): Promise<PouchDB.Core.Response | PouchDB.Core.Error>;
  changePassword(username: string, password?: string, dbName?: string): Promise<PouchDB.Core.Response | PouchDB.Core.Error>;
  changeUsername(oldUsername: string, newUsername: string, dbName?: string): Promise<PouchDB.Core.Response | PouchDB.Core.Error>;
  signUpAdmin(adminUsername: string, adminPassword?: string, dbName?: string): Promise<any>;
  deleteAdmin(adminUsername: string, dbName?: string): Promise<any>;
  disconnect(dbName?: string): Promise<any>;

  destroy(dbName?: string): Promise<void>;
  defaults(options: PouchDB.Configuration.DatabaseConfiguration): void;
  close(dbName?: string): Promise<void>;
  getSession(dbName?: string): Promise<any>;

  sync(localDBName: string, remoteDBName?: string, options?: PouchDB.Replication.SyncOptions): PouchDB.Replication.Sync<{}>;
  push(localDBName: string, remoteDBName?: string, options?: PouchDB.Replication.ReplicateOptions): PouchDB.Replication.Replication<{}>;
  pull(localDBName: string, remoteDBName?: string, options?: PouchDB.Replication.ReplicateOptions): PouchDB.Replication.Replication<{}>;

  changes<Content extends {} = {}>(options?: PouchDB.Core.ChangesOptions, dbName?: string): PouchDB.Core.Changes<Content>;

  get<Content extends {} = {}>(docId: PouchDB.Core.DocumentId, options?: PouchDB.Core.GetOptions, dbName?: string): Promise<PouchDB.Core.Document<Content> & PouchDB.Core.GetMeta>;
  put<Content extends {} = {}>(doc: PouchDB.Core.PutDocument<Content>, options?: PouchDB.Core.PutOptions, dbName?: string): Promise<PouchDB.Core.Response>;
  post<Content extends {} = {}>(doc: PouchDB.Core.PostDocument<Content>, options?: PouchDB.Core.Options, dbName?: string): Promise<PouchDB.Core.Response>;
  remove(doc: PouchDB.Core.RemoveDocument, options?: PouchDB.Core.Options, dbName?: string): Promise<PouchDB.Core.Response>;

  query<Content extends {} = {}, Result extends {} = {}>(fun: any, options?: PouchDB.Query.Options<Content, Result>, dbName?: string): Promise<PouchDB.Query.Response<Result>>;
  find<Content extends {} = {}>(request: PouchDB.Find.FindRequest<Content>, dbName?: string): Promise<PouchDB.Find.FindResponse<Content>>;
  createIndex<Content extends {} = {}>(index: PouchDB.Find.CreateIndexOptions, dbName?: string): Promise<PouchDB.Find.CreateIndexResponse<Content>>;

  allDocs<Content extends {} = {}>(options?: PouchDB.Core.AllDocsWithKeyOptions | PouchDB.Core.AllDocsWithKeysOptions | PouchDB.Core.AllDocsWithinRangeOptions | PouchDB.Core.AllDocsOptions, dbName?: string): Promise<PouchDB.Core.AllDocsResponse<Content>>;
  bulkDocs<Content extends {} = {}>(docs: Array<PouchDB.Core.PutDocument<Content>>, options?: PouchDB.Core.BulkDocsOptions, dbName?: string): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>;
  compact(options?: PouchDB.Core.CompactOptions, dbName?: string): Promise<PouchDB.Core.Response>;
  viewCleanup(dbName?: string): Promise<PouchDB.Core.BasicResponse>;
  info(dbName?: string): Promise<PouchDB.Core.DatabaseInfo>;

  putAttachment(docId: PouchDB.Core.DocumentId, rev: PouchDB.Core.RevisionId, attachment: { id: string; data: PouchDB.Core.AttachmentData; type: string; }, dbName?: string): Promise<PouchDB.Core.Response>;
  getAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, dbName?: string): Promise<Blob | Buffer>;
  deleteAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, docRev: PouchDB.Core.RevisionId, dbName?: string): Promise<PouchDB.Core.Response>;
}

declare module 'vue/types/vue' {
  interface Vue {
    $pouch: PouchVueAPI;
    $databases: Record<string, PouchDB.Database<{}> >;
    _liveFeeds: Record<string, PouchDB.LiveFind.LiveFeed<{}>>;
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends _Vue> {
    pouch?: ComponentPouchOptions | (() => ComponentPouchOptions);
  }
}

// Define the plugin structure
declare const PouchVue: PluginObject<PouchVuePluginOptions>; // Changed to PluginObject
export default PouchVue;
