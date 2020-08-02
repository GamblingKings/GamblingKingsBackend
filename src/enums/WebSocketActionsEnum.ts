/* ----------------------------------------------------------------------------
 * WebSocket Actions
 * ------------------------------------------------------------------------- */

/**
 *  Websocket action types enum
 */
export enum WebSocketActionsEnum {
  GET_ALL_GAMES = 'GET_ALL_GAMES',
  GET_ALL_USERS = 'GET_ALL_USERS',
  CREATE_GAME = 'CREATE_GAME',
  SEND_MESSAGE = 'SEND_MESSAGE',
  JOIN_GAME = 'JOIN_GAME',
  LEAVE_GAME = 'LEAVE_GAME',
  USER_UPDATE = 'USER_UPDATE',
  GAME_UPDATE = 'GAME_UPDATE',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  IN_GAME_UPDATE = 'IN_GAME_UPDATE',
  IN_GAME_MESSAGE = 'IN_GAME_MESSAGE',
  START_GAME = 'START_GAME',
  GAME_PAGE_LOAD = 'GAME_PAGE_LOAD',
  GAME_START = 'GAME_START',
  DRAW_TILE = 'DRAW_TILE',
  PLAY_TILE = 'PLAY_TILE',
}
