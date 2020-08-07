import {
  CreateGamePayload,
  DrawTilePayload,
  GameStartPayload,
  GameUpdatePayload,
  GetAllGamesPayload,
  GetAllUsersPayload,
  InGameMessagePayload,
  InGameUpdatePayload,
  JoinGamePayload,
  LambdaEventBodyPayloadOptions,
  LeaveGamePayload,
  PlayedTileInteractionPayload,
  PlayTilePayload,
  SendMessagePayload,
  UserUpdatePayload,
} from '../types/payload';
import { WebSocketResponse } from '../types/response';
import { WebSocketActionsEnum } from '../enums/WebSocketActionsEnum';

/**
 * Create a websocket response object.
 * @param {WebSocketActionsEnum} action one of the actions from WebSocketActions
 * @param {LambdaEventBodyPayloadOptions} payload one of the payload options from LambdaEventBodyPayloadOptions
 */
const createWSResponse = <T extends LambdaEventBodyPayloadOptions>(
  action: WebSocketActionsEnum,
  payload: T,
): WebSocketResponse => {
  return {
    action,
    payload,
  };
};

/* ----------------------------------------------------------------------------
 * User Related Responses
 * ------------------------------------------------------------------------- */

/**
 * Create GET_ALL_USERS response object.
 * @param {GetAllUsersPayload} payload payload object
 */
export const createGetAllUsersResponse = (payload: GetAllUsersPayload): WebSocketResponse => {
  return createWSResponse<GetAllUsersPayload>(WebSocketActionsEnum.GET_ALL_USERS, payload);
};

/**
 * Create USER_UPDATE response object.
 * @param {UserUpdatePayload} payload payload object
 */
export const createUserUpdateResponse = (payload: UserUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.USER_UPDATE, payload);
};

/* ----------------------------------------------------------------------------
 * Game Related Response
 * ------------------------------------------------------------------------- */

/**
 * Create GET_ALL_GAMES response object.
 * @param {GetAllGamesPayload} payload payload object
 */
export const createGetAllGamesResponse = (payload: GetAllGamesPayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.GET_ALL_GAMES, payload);
};

/**
 * Create CREATE_GAME response object.
 * @param {CreateGamePayload | undefined} payload payload object
 */
export const createGameResponse = (payload: CreateGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActionsEnum.CREATE_GAME, wsPayload);
};

/**
 * Create JOIN_GAME response object.
 * @param {JoinGamePayload | undefined} payload payload object
 */
export const createJoinGameResponse = (payload: JoinGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActionsEnum.JOIN_GAME, wsPayload);
};

/**
 * Create LEAVE_GAME response object.
 * @param {JoinGamePayload | undefined} payload payload object
 */
export const createLeaveResponse = (payload: LeaveGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActionsEnum.LEAVE_GAME, wsPayload);
};

/**
 * Create GAME_UPDATE response object.
 * @param {GameUpdatePayload} payload object
 */
export const createGameUpdateResponse = (payload: GameUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.GAME_UPDATE, payload);
};

/**
 * Create IN_GAME_UPDATE response object.
 * @param {InGameUpdatePayload} payload payload object
 */
export const createInGameUpdateResponse = (payload: InGameUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.IN_GAME_UPDATE, payload);
};

/**
 * Create IN_GAME_MESSAGE response object.
 * @param {string} username user who joins or leave a game
 * @param {string} message in game message
 */
export const createInGameMessageResponse = (username: string, message: string): WebSocketResponse => {
  const wsPayload: InGameMessagePayload = {
    username,
    message,
    time: new Date().toISOString(),
  };
  return createWSResponse(WebSocketActionsEnum.IN_GAME_MESSAGE, wsPayload);
};

/**
 * Create START_GAME response object.
 */
export const createStartGameResponse = (): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.START_GAME, {});
};

/**
 * Create GAME_PAGE_LOAD response object.
 */
export const createGamePageLoadResponse = (): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.GAME_PAGE_LOAD, {});
};

/**
 * Create GAME_START response object.
 * @param {GameStartPayload} payload payload object
 */
export const createGameStartResponse = (payload: GameStartPayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.GAME_START, payload);
};

/**
 * Create DRAW_TILE response object.
 * @param {DrawTilePayload} payload payload object
 */
export const createDrawTileResponse = (payload: DrawTilePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.DRAW_TILE, payload);
};

/**
 * Create PLAY_TILE response object.
 * @param {DrawTilePayload} payload payload object
 */
export const createPlayTileResponse = (payload: PlayTilePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.PLAY_TILE, payload);
};

/**
 * Create PLAYED_TILE_INTERACTION response object.
 * @param {DrawTilePayload} payload payload object
 */
export const createPlayedTileInteractionResponse = (payload: PlayedTileInteractionPayload): WebSocketResponse => {
  return createWSResponse(WebSocketActionsEnum.PLAYED_TILE_INTERACTION, payload);
};

/* ----------------------------------------------------------------------------
 * Success and Failure Response
 * ------------------------------------------------------------------------- */

/**
 * Add success key-value pair to the response payload object.
 * @param {WebSocketResponse} webSocketResponse websocket response object
 */
export const successWebSocketResponse = (webSocketResponse: WebSocketResponse): WebSocketResponse => {
  const newResponse = webSocketResponse;
  newResponse.payload.success = true;
  return newResponse;
};

/**
 * Add failure key-value pair to the response payload object.
 * @param {WebSocketResponse} webSocketResponse websocket response object
 * @param {string} errorMessage error message
 */
export const failedWebSocketResponse = (
  webSocketResponse: WebSocketResponse,
  errorMessage: string,
): WebSocketResponse => {
  const newResponse = webSocketResponse;
  newResponse.payload.success = false;
  newResponse.payload.error = errorMessage;
  return newResponse;
};

/**
 * Create LOGIN_SUCCESS success response object.
 */
export const createLoginSuccessResponse = (): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActionsEnum.LOGIN_SUCCESS, {});
  return successWebSocketResponse(wsResponse);
};

/**
 * Create LOGIN_SUCCESS failure response object.
 * @param {string} errorMessage error message during login
 */
export const createLoginFailureResponse = (errorMessage: string): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActionsEnum.LOGIN_SUCCESS, {});
  return failedWebSocketResponse(wsResponse, errorMessage);
};

/* ----------------------------------------------------------------------------
 * Message
 * ------------------------------------------------------------------------- */

/**
 * Create SEND_MESSAGE response object
 * @param {string} username caller username
 * @param {string} message message to send to all users
 */
export const createSendMessageResponse = ({ username, message }: SendMessagePayload): WebSocketResponse => {
  const wsPayload = {
    username,
    message,
    time: new Date().toISOString(),
  };
  return createWSResponse(WebSocketActionsEnum.SEND_MESSAGE, wsPayload);
};
