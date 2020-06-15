import { LambdaEventBodyPayloadOptions, WebSocketActions, WebSocketResponse } from '../types';
import { User } from '../models/User';
import { Game } from '../models/Game';

/**
 * Create a websocket response object
 * @param {WebSocketActions} action one of the actions from WebSocketActions
 * @param {LambdaEventBodyPayloadOptions} payload one of the payload options from LambdaEventBodyPayloadOptions
 */
export const createWSResponse = (
  action: WebSocketActions,
  payload: LambdaEventBodyPayloadOptions,
): WebSocketResponse => {
  return {
    action,
    payload,
  };
};

/**
 * Create SEND_MESSAGE response object
 * @param {string} message message
 */
export const createWSMessageResponse = (message: string): WebSocketResponse => {
  return createWSResponse(WebSocketActions.SEND_MESSAGE, { message });
};

/**
 * Create GET_ALL_USERS response object
 * @param {User[]} users an array of User objects
 */
export const createWSAllUsersResponse = (users: User[]): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GET_ALL_USERS, { users });
};

/**
 * Create GET_ALL_GAMES response object
 * @param {Game[]} games a list of Game objects
 */
export const createWSAllGamesResponse = (games: Game[]): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GET_ALL_GAMES, { games });
};

export const createGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  return createWSResponse(WebSocketActions.CREATE_GAME, wsPayload);
};

export const createJoinGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  return createWSResponse(WebSocketActions.JOIN_GAME, wsPayload);
};

export const successWebSocketResponse = (webSocketResponse: WebSocketResponse): WebSocketResponse => {
  const newResponse = webSocketResponse;
  newResponse.payload.success = true;
  return newResponse;
};

export const failedWebSocketResponse = (webSocketResponse: WebSocketResponse, error: string): WebSocketResponse => {
  const newResponse = webSocketResponse;
  newResponse.payload.success = true;
  newResponse.payload.error = error;
  return newResponse;
};

export const createLoginSuccessResponse = (): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
  return successWebSocketResponse(wsResponse);
};

export const createLoginFailureResponse = (errorMessage: string): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
  return failedWebSocketResponse(wsResponse, errorMessage);
};
