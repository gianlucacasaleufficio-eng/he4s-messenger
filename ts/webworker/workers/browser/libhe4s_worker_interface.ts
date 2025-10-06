/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import {
  BaseWrapperActionsCalls,
  BlindingActionsCalls,
  ContactInfoSet,
  ContactsWrapperActionsCalls,
  ConvoInfoVolatileWrapperActionsCalls,
  LegacyGroupInfo,
  ProfilePicture,
  UserConfigWrapperActionsCalls,
  UserGroupsWrapperActionsCalls,
} from 'libhe4s_util_nodejs';
import { join } from 'path';

import { getAppRootPath } from '../../../node/getRootPath';
import { WorkerInterface } from '../../worker_interface';
import { ConfigWrapperObjectTypes, LibHE4SWorkerFunctions } from './libhe4s_worker_functions';

let libhe4sWorkerInterface: WorkerInterface | undefined;

const internalCallLibHE4SWorker = async ([
  config,
  fnName,
  ...args
]: LibHE4SWorkerFunctions): Promise<unknown> => {
  if (!libhe4sWorkerInterface) {
    const libhe4sWorkerPath = join(
      getAppRootPath(),
      'ts',
      'webworker',
      'workers',
      'node',
      'libhe4s',
      'libhe4s.worker.compiled.js'
    );

    libhe4sWorkerInterface = new WorkerInterface(libhe4sWorkerPath, 1 * 60 * 1000);
  }
  return libhe4sWorkerInterface?.callWorker(config, fnName, ...args);
};

export const GenericWrapperActions = {
  init: async (
    wrapperId: ConfigWrapperObjectTypes,
    ed25519Key: Uint8Array,
    dump: Uint8Array | null
  ) =>
    /** base wrapper generic actions */
    callLibHE4SWorker([wrapperId, 'init', ed25519Key, dump]) as Promise<void>,
  /** This function is used to free wrappers from memory only.
   *
   * See freeUserWrapper() in libhe4s.worker.ts */
  free: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'free']) as Promise<void>,
  confirmPushed: async (wrapperId: ConfigWrapperObjectTypes, seqno: number, hash: string) =>
    callLibHE4SWorker([wrapperId, 'confirmPushed', seqno, hash]) as ReturnType<
      BaseWrapperActionsCalls['confirmPushed']
    >,
  dump: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'dump']) as Promise<
      ReturnType<BaseWrapperActionsCalls['dump']>
    >,
  merge: async (
    wrapperId: ConfigWrapperObjectTypes,
    toMerge: Array<{ hash: string; data: Uint8Array }>
  ) =>
    callLibHE4SWorker([wrapperId, 'merge', toMerge]) as Promise<
      ReturnType<BaseWrapperActionsCalls['merge']>
    >,
  needsDump: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'needsDump']) as Promise<
      ReturnType<BaseWrapperActionsCalls['needsDump']>
    >,
  needsPush: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'needsPush']) as Promise<
      ReturnType<BaseWrapperActionsCalls['needsPush']>
    >,
  push: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'push']) as Promise<
      ReturnType<BaseWrapperActionsCalls['push']>
    >,
  storageNamespace: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'storageNamespace']) as Promise<
      ReturnType<BaseWrapperActionsCalls['storageNamespace']>
    >,
  currentHashes: async (wrapperId: ConfigWrapperObjectTypes) =>
    callLibHE4SWorker([wrapperId, 'currentHashes']) as Promise<
      ReturnType<BaseWrapperActionsCalls['currentHashes']>
    >,
};

export const UserConfigWrapperActions: UserConfigWrapperActionsCalls = {
  /* Reuse the GenericWrapperActions with the UserConfig argument */
  init: async (ed25519Key: Uint8Array, dump: Uint8Array | null) =>
    GenericWrapperActions.init('UserConfig', ed25519Key, dump),
  free: async () => GenericWrapperActions.free('UserConfig'),
  confirmPushed: async (seqno: number, hash: string) =>
    GenericWrapperActions.confirmPushed('UserConfig', seqno, hash),
  dump: async () => GenericWrapperActions.dump('UserConfig'),
  merge: async (toMerge: Array<{ hash: string; data: Uint8Array }>) =>
    GenericWrapperActions.merge('UserConfig', toMerge),
  needsDump: async () => GenericWrapperActions.needsDump('UserConfig'),
  needsPush: async () => GenericWrapperActions.needsPush('UserConfig'),
  push: async () => GenericWrapperActions.push('UserConfig'),
  storageNamespace: async () => GenericWrapperActions.storageNamespace('UserConfig'),
  currentHashes: async () => GenericWrapperActions.currentHashes('UserConfig'),

  /** UserConfig wrapper specific actions */
  getPriority: async () =>
    callLibHE4SWorker(['UserConfig', 'getPriority']) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['getPriority']>
    >,
  getName: async () =>
    callLibHE4SWorker(['UserConfig', 'getName']) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['getName']>
    >,
  getProfilePic: async () =>
    callLibHE4SWorker(['UserConfig', 'getProfilePic']) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['getProfilePic']>
    >,
  setPriority: async (priority: number) =>
    callLibHE4SWorker(['UserConfig', 'setPriority', priority]) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['setPriority']>
    >,
  setName: async (name: string) =>
    callLibHE4SWorker(['UserConfig', 'setName', name]) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['setName']>
    >,
  setNameTruncated: async (name: string) =>
    callLibHE4SWorker(['UserConfig', 'setNameTruncated', name]) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['setNameTruncated']>
    >,
  setProfilePic: async (profilePic: ProfilePicture) =>
    callLibHE4SWorker(['UserConfig', 'setProfilePic', profilePic]) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['setProfilePic']>
    >,
  getEnableBlindedMsgRequest: async () =>
    callLibHE4SWorker(['UserConfig', 'getEnableBlindedMsgRequest']) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['getEnableBlindedMsgRequest']>
    >,
  setEnableBlindedMsgRequest: async (blindedMsgRequests: boolean) =>
    callLibHE4SWorker([
      'UserConfig',
      'setEnableBlindedMsgRequest',
      blindedMsgRequests,
    ]) as Promise<ReturnType<UserConfigWrapperActionsCalls['setEnableBlindedMsgRequest']>>,
  getNoteToSelfExpiry: async () =>
    callLibHE4SWorker(['UserConfig', 'getNoteToSelfExpiry']) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['getNoteToSelfExpiry']>
    >,
  setNoteToSelfExpiry: async (expirySeconds: number) =>
    callLibHE4SWorker(['UserConfig', 'setNoteToSelfExpiry', expirySeconds]) as Promise<
      ReturnType<UserConfigWrapperActionsCalls['setNoteToSelfExpiry']>
    >,
};

export const ContactsWrapperActions: ContactsWrapperActionsCalls = {
  /* Reuse the GenericWrapperActions with the ContactConfig argument */
  init: async (ed25519Key: Uint8Array, dump: Uint8Array | null) =>
    GenericWrapperActions.init('ContactsConfig', ed25519Key, dump),
  free: async () => GenericWrapperActions.free('ContactsConfig'),
  confirmPushed: async (seqno: number, hash: string) =>
    GenericWrapperActions.confirmPushed('ContactsConfig', seqno, hash),
  dump: async () => GenericWrapperActions.dump('ContactsConfig'),
  merge: async (toMerge: Array<{ hash: string; data: Uint8Array }>) =>
    GenericWrapperActions.merge('ContactsConfig', toMerge),
  needsDump: async () => GenericWrapperActions.needsDump('ContactsConfig'),
  needsPush: async () => GenericWrapperActions.needsPush('ContactsConfig'),
  push: async () => GenericWrapperActions.push('ContactsConfig'),
  storageNamespace: async () => GenericWrapperActions.storageNamespace('ContactsConfig'),
  currentHashes: async () => GenericWrapperActions.currentHashes('ContactsConfig'),

  /** ContactsConfig wrapper specific actions */
  get: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ContactsConfig', 'get', pubkeyHex]) as Promise<
      ReturnType<ContactsWrapperActionsCalls['get']>
    >,
  getAll: async () =>
    callLibHE4SWorker(['ContactsConfig', 'getAll']) as Promise<
      ReturnType<ContactsWrapperActionsCalls['getAll']>
    >,

  erase: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ContactsConfig', 'erase', pubkeyHex]) as Promise<
      ReturnType<ContactsWrapperActionsCalls['erase']>
    >,

  set: async (contact: ContactInfoSet) =>
    callLibHE4SWorker(['ContactsConfig', 'set', contact]) as Promise<
      ReturnType<ContactsWrapperActionsCalls['set']>
    >,
};

export const UserGroupsWrapperActions: UserGroupsWrapperActionsCalls = {
  /* Reuse the GenericWrapperActions with the ContactConfig argument */
  init: async (ed25519Key: Uint8Array, dump: Uint8Array | null) =>
    GenericWrapperActions.init('UserGroupsConfig', ed25519Key, dump),
  free: async () => GenericWrapperActions.free('UserGroupsConfig'),
  confirmPushed: async (seqno: number, hash: string) =>
    GenericWrapperActions.confirmPushed('UserGroupsConfig', seqno, hash),
  dump: async () => GenericWrapperActions.dump('UserGroupsConfig'),
  merge: async (toMerge: Array<{ hash: string; data: Uint8Array }>) =>
    GenericWrapperActions.merge('UserGroupsConfig', toMerge),
  needsDump: async () => GenericWrapperActions.needsDump('UserGroupsConfig'),
  needsPush: async () => GenericWrapperActions.needsPush('UserGroupsConfig'),
  push: async () => GenericWrapperActions.push('UserGroupsConfig'),
  storageNamespace: async () => GenericWrapperActions.storageNamespace('UserGroupsConfig'),
  currentHashes: async () => GenericWrapperActions.currentHashes('UserGroupsConfig'),

  /** UserGroups wrapper specific actions */

  getCommunityByFullUrl: async (fullUrlWithOrWithoutPubkey: string) =>
    callLibHE4SWorker([
      'UserGroupsConfig',
      'getCommunityByFullUrl',
      fullUrlWithOrWithoutPubkey,
    ]) as Promise<ReturnType<UserGroupsWrapperActionsCalls['getCommunityByFullUrl']>>,

  setCommunityByFullUrl: async (fullUrl: string, priority: number) =>
    callLibHE4SWorker([
      'UserGroupsConfig',
      'setCommunityByFullUrl',
      fullUrl,
      priority,
    ]) as Promise<ReturnType<UserGroupsWrapperActionsCalls['setCommunityByFullUrl']>>,

  getAllCommunities: async () =>
    callLibHE4SWorker(['UserGroupsConfig', 'getAllCommunities']) as Promise<
      ReturnType<UserGroupsWrapperActionsCalls['getAllCommunities']>
    >,

  eraseCommunityByFullUrl: async (fullUrlWithoutPubkey: string) =>
    callLibHE4SWorker([
      'UserGroupsConfig',
      'eraseCommunityByFullUrl',
      fullUrlWithoutPubkey,
    ]) as Promise<ReturnType<UserGroupsWrapperActionsCalls['eraseCommunityByFullUrl']>>,

  buildFullUrlFromDetails: async (baseUrl: string, roomId: string, pubkeyHex: string) =>
    callLibHE4SWorker([
      'UserGroupsConfig',
      'buildFullUrlFromDetails',
      baseUrl,
      roomId,
      pubkeyHex,
    ]) as Promise<ReturnType<UserGroupsWrapperActionsCalls['buildFullUrlFromDetails']>>,

  getLegacyGroup: async (pubkeyHex: string) =>
    callLibHE4SWorker(['UserGroupsConfig', 'getLegacyGroup', pubkeyHex]) as Promise<
      ReturnType<UserGroupsWrapperActionsCalls['getLegacyGroup']>
    >,
  getAllLegacyGroups: async () =>
    callLibHE4SWorker(['UserGroupsConfig', 'getAllLegacyGroups']) as Promise<
      ReturnType<UserGroupsWrapperActionsCalls['getAllLegacyGroups']>
    >,

  setLegacyGroup: async (info: LegacyGroupInfo) =>
    callLibHE4SWorker(['UserGroupsConfig', 'setLegacyGroup', info]) as Promise<
      ReturnType<UserGroupsWrapperActionsCalls['setLegacyGroup']>
    >,

  eraseLegacyGroup: async (pubkeyHex: string) =>
    callLibHE4SWorker(['UserGroupsConfig', 'eraseLegacyGroup', pubkeyHex]) as Promise<
      ReturnType<UserGroupsWrapperActionsCalls['eraseLegacyGroup']>
    >,
};

export const ConvoInfoVolatileWrapperActions: ConvoInfoVolatileWrapperActionsCalls = {
  /* Reuse the GenericWrapperActions with the ContactConfig argument */
  init: async (ed25519Key: Uint8Array, dump: Uint8Array | null) =>
    GenericWrapperActions.init('ConvoInfoVolatileConfig', ed25519Key, dump),
  free: async () => GenericWrapperActions.free('ConvoInfoVolatileConfig'),
  confirmPushed: async (seqno: number, hash: string) =>
    GenericWrapperActions.confirmPushed('ConvoInfoVolatileConfig', seqno, hash),
  dump: async () => GenericWrapperActions.dump('ConvoInfoVolatileConfig'),
  merge: async (toMerge: Array<{ hash: string; data: Uint8Array }>) =>
    GenericWrapperActions.merge('ConvoInfoVolatileConfig', toMerge),
  needsDump: async () => GenericWrapperActions.needsDump('ConvoInfoVolatileConfig'),
  needsPush: async () => GenericWrapperActions.needsPush('ConvoInfoVolatileConfig'),
  push: async () => GenericWrapperActions.push('ConvoInfoVolatileConfig'),
  storageNamespace: async () => GenericWrapperActions.storageNamespace('ConvoInfoVolatileConfig'),
  currentHashes: async () => GenericWrapperActions.currentHashes('ConvoInfoVolatileConfig'),

  /** ConvoInfoVolatile wrapper specific actions */
  // 1o1
  get1o1: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'get1o1', pubkeyHex]) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['get1o1']>
    >,

  getAll1o1: async () =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'getAll1o1']) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['getAll1o1']>
    >,

  set1o1: async (pubkeyHex: string, lastRead: number, unread: boolean) =>
    callLibHE4SWorker([
      'ConvoInfoVolatileConfig',
      'set1o1',
      pubkeyHex,
      lastRead,
      unread,
    ]) as Promise<ReturnType<ConvoInfoVolatileWrapperActionsCalls['set1o1']>>,

  erase1o1: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'erase1o1', pubkeyHex]) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['erase1o1']>
    >,

  // legacy groups
  getLegacyGroup: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'getLegacyGroup', pubkeyHex]) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['getLegacyGroup']>
    >,

  getAllLegacyGroups: async () =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'getAllLegacyGroups']) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['getAllLegacyGroups']>
    >,

  setLegacyGroup: async (pubkeyHex: string, lastRead: number, unread: boolean) =>
    callLibHE4SWorker([
      'ConvoInfoVolatileConfig',
      'setLegacyGroup',
      pubkeyHex,
      lastRead,
      unread,
    ]) as Promise<ReturnType<ConvoInfoVolatileWrapperActionsCalls['setLegacyGroup']>>,

  eraseLegacyGroup: async (pubkeyHex: string) =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'eraseLegacyGroup', pubkeyHex]) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['eraseLegacyGroup']>
    >,

  // communities
  getCommunity: async (communityFullUrl: string) =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'getCommunity', communityFullUrl]) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['getCommunity']>
    >,

  getAllCommunities: async () =>
    callLibHE4SWorker(['ConvoInfoVolatileConfig', 'getAllCommunities']) as Promise<
      ReturnType<ConvoInfoVolatileWrapperActionsCalls['getAllCommunities']>
    >,

  setCommunityByFullUrl: async (fullUrlWithPubkey: string, lastRead: number, unread: boolean) =>
    callLibHE4SWorker([
      'ConvoInfoVolatileConfig',
      'setCommunityByFullUrl',
      fullUrlWithPubkey,
      lastRead,
      unread,
    ]) as Promise<ReturnType<ConvoInfoVolatileWrapperActionsCalls['setCommunityByFullUrl']>>,

  eraseCommunityByFullUrl: async (fullUrlWithOrWithoutPubkey: string) =>
    callLibHE4SWorker([
      'ConvoInfoVolatileConfig',
      'eraseCommunityByFullUrl',
      fullUrlWithOrWithoutPubkey,
    ]) as Promise<ReturnType<ConvoInfoVolatileWrapperActionsCalls['eraseCommunityByFullUrl']>>,
};

export const BlindingActions: BlindingActionsCalls = {
  blindVersionPubkey: async (opts: { ed25519SecretKey: Uint8Array }) =>
    callLibHE4SWorker(['Blinding', 'blindVersionPubkey', opts]) as Promise<
      ReturnType<BlindingActionsCalls['blindVersionPubkey']>
    >,
  blindVersionSign: async (opts: { ed25519SecretKey: Uint8Array; sigTimestampSeconds: number }) =>
    callLibHE4SWorker(['Blinding', 'blindVersionSign', opts]) as Promise<
      ReturnType<BlindingActionsCalls['blindVersionSign']>
    >,
};

export const callLibHE4SWorker = async (
  callToMake: LibHE4SWorkerFunctions
): Promise<unknown> => {
  return internalCallLibHE4SWorker(callToMake);
};
