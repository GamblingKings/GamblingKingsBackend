import { LambdaEventBodyPayloadOptions, WebSocketResponse, WebSocketActions } from '../types';
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
export const createWSMessageResponse = (message: string): string => {
  const wsPayload = { message } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
  return JSON.stringify(wsResponse);
};

/**
 * Create GET_ALL_USERS response object
 * @param {User[]} users an array of User objects
 */
export const createWSAllUsersResponse = (users: User[]): string => {
  const wsPayload = { users } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_USERS, wsPayload);
  return JSON.stringify(wsResponse);
};

/**
 * Create GET_ALL_GAMES response object
 * @param {Game[]} users an array of Game objects
 */
export const createWSAllGamesResponse = (games: Game[]): string => {
  console.log(games);
  const wsPayload = { games } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_GAMES, wsPayload);
  return JSON.stringify(wsResponse);
};
