import { DEFAULT_DOCUMENT_VERSION } from '../utils/constants';
import { GameStates } from '../types/states';

/* ----------------------------------------------------------------------------
 * User
 * ------------------------------------------------------------------------- */
export const FAKE_CONNECTION_ID1 = 'fake-connection-id-1';
export const FAKE_CONNECTION_ID2 = 'fake-connection-id-2';
export const FAKE_CONNECTION_ID3 = 'fake-connection-id-3';
export const FAKE_CONNECTION_ID4 = 'fake-connection-id-4';
export const FAKE_USERNAME1 = 'fake-username-1';
export const FAKE_USERNAME2 = 'fake-username-2';
export const TEST_USER_OBJECT1 = { connectionId: FAKE_CONNECTION_ID1 };
export const TEST_USER_OBJECT2 = { connectionId: FAKE_CONNECTION_ID2 };
export const TEST_USER_OBJECT3 = { connectionId: FAKE_CONNECTION_ID3 };

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */
export const FAKE_GAME_ID = 'fake-game-id';
export const FAKE_GAME_NAME1 = 'fake-game-name1';
export const FAKE_GAME_NAME2 = 'fake-game-name2';
export const FAKE_GAME_TYPE1 = 'fake-game-type1';
export const FAKE_GAME_TYPE2 = 'fake-game-type2';
export const FAKE_GAME_VERSION1 = 'fake-game-version1';
export const FAKE_GAME_VERSION2 = 'fake-game-version2';
export const TEST_GAME_OBJECT1 = {
  host: TEST_USER_OBJECT1,
  users: [TEST_USER_OBJECT1],
  gameName: FAKE_GAME_NAME1,
  gameType: FAKE_GAME_TYPE1,
  gameVersion: FAKE_GAME_VERSION1,
  started: false,
  state: GameStates.CREATED,
  version: DEFAULT_DOCUMENT_VERSION,
  gameLoadedCount: 0,
};
export const TEST_GAME_OBJECT2 = {
  host: TEST_USER_OBJECT2,
  users: [TEST_USER_OBJECT2],
  gameName: FAKE_GAME_NAME2,
  gameType: FAKE_GAME_TYPE2,
  gameVersion: FAKE_GAME_VERSION2,
  started: false,
  state: GameStates.CREATED,
  version: DEFAULT_DOCUMENT_VERSION,
  gameLoadedCount: 0,
};

/* ----------------------------------------------------------------------------
 * Error
 * ------------------------------------------------------------------------- */
export const CONDITIONAL_FAILED_MSG = 'The conditional request failed';
