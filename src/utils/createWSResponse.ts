import {
  CreateGamePayload,
  GameUpdatePayload,
  GetAllGamesPayload,
  GetAllUsersPayload,
  InGameMessagePayload,
  InGameUpdatePayload,
  JoinGamePayload,
  LambdaEventBodyPayloadOptions,
  LeaveGamePayload,
  SendMessagePayload,
  UserUpdatePayload,
} from '../types/payload';
import { WebSocketResponse } from '../types/response';
import { WebSocketActions } from '../types/WebSocketActions';

/**
 * Create a websocket response object.
 * @param {WebSocketActions} action one of the actions from WebSocketActions
 * @param {LambdaEventBodyPayloadOptions} payload one of the payload options from LambdaEventBodyPayloadOptions
 */
const createWSResponse = <T extends LambdaEventBodyPayloadOptions>(
  action: WebSocketActions,
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
  return createWSResponse<GetAllUsersPayload>(WebSocketActions.GET_ALL_USERS, payload);
};

/**
 * Create USER_UPDATE response object.
 * @param {UserUpdatePayload} payload payload object
 */
export const createUserUpdateResponse = (payload: UserUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActions.USER_UPDATE, payload);
};

/* ----------------------------------------------------------------------------
 * Game Related Response
 * ------------------------------------------------------------------------- */

/**
 * Create GET_ALL_GAMES response object.
 * @param {GetAllGamesPayload} payload payload object
 */
export const createGetAllGamesResponse = (payload: GetAllGamesPayload): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GET_ALL_GAMES, payload);
};

/**
 * Create CREATE_GAME response object.
 * @param {CreateGamePayload | undefined} payload payload object
 */
export const createGameResponse = (payload: CreateGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActions.CREATE_GAME, wsPayload);
};

/**
 * Create JOIN_GAME response object.
 * @param {JoinGamePayload | undefined} payload payload object
 */
export const createJoinGameResponse = (payload: JoinGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActions.JOIN_GAME, wsPayload);
};

/**
 * Create LEAVE_GAME response object.
 * @param {JoinGamePayload | undefined} payload payload object
 */
export const createLeaveResponse = (payload: LeaveGamePayload | undefined): WebSocketResponse => {
  const wsPayload = payload || {};
  return createWSResponse(WebSocketActions.LEAVE_GAME, wsPayload);
};

/**
 * Create GAME_UPDATE response object.
 * @param {GameUpdatePayload} payload object
 */
export const createGameUpdateResponse = (payload: GameUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GAME_UPDATE, payload);
};

/**
 * Create IN_GAME_UPDATE response object.
 * @param {InGameUpdatePayload} payload payload object
 */
export const createInGameUpdateResponse = (payload: InGameUpdatePayload): WebSocketResponse => {
  return createWSResponse(WebSocketActions.IN_GAME_UPDATE, payload);
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
  return createWSResponse(WebSocketActions.IN_GAME_MESSAGE, wsPayload);
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
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
  return successWebSocketResponse(wsResponse);
};

/**
 * Create LOGIN_SUCCESS failure response object.
 * @param {string} errorMessage error message during login
 */
export const createLoginFailureResponse = (errorMessage: string): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
  return failedWebSocketResponse(wsResponse, errorMessage);
};

export const createStartGameResponse = (): WebSocketResponse => {
  return createWSResponse(WebSocketActions.START_GAME, {});
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
  return createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
};
