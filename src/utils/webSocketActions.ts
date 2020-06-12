import { LambdaEventBodyPayloadOptions, WebSocketResponse, WebSocketActions, SuccessResponse } from '../types';
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
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, { message });
  return wsResponse;
};

/**
 * Create GET_ALL_USERS response object
 * @param {User[]} users an array of User objects
 */
export const createWSAllUsersResponse = (users: User[]): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_USERS, { users });
  return wsResponse;
};

/**
 * Create GET_ALL_GAMES response object
 * @param {Game[]} users an array of Game objects
 */
export const createWSAllGamesResponse = (games: Game[]): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_GAMES, { games });
  return wsResponse;
};

export const createGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  const wsResponse = createWSResponse(WebSocketActions.CREATE_GAME, wsPayload);
  return wsResponse;
};

export const createJoinGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  const wsResponse = createWSResponse(WebSocketActions.JOIN_GAME, wsPayload);
  return wsResponse;
};

export const successWebSocketResponse = (webSocketResponse: WebSocketResponse): WebSocketResponse => {
  return { success: true, ...webSocketResponse };
};

export const failedWebSocketResponse = (error: string): SuccessResponse => {
  return { success: false, error };
};
