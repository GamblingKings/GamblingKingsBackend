import { GameStates, LambdaEventBodyPayloadOptions, UserStates, WebSocketActions, WebSocketResponse } from '../types';
import { User } from '../models/User';
import { Game } from '../models/Game';

/**
 * Create a websocket response object.
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

/* ----------------------------------------------------------------------------
 * User Related Responses
 * ------------------------------------------------------------------------- */

/**
 * Create GET_ALL_USERS response object.
 * @param {User[]} users an array of User objects
 */
export const createWSAllUsersResponse = (users: User[]): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GET_ALL_USERS, { users });
};

/**
 * Create USER_UPDATE response object.
 * @param {User} user user object
 * @param {UserStates} state user state
 */
export const createUserUpdateResponse = (user: User, state: UserStates): WebSocketResponse => {
  return createWSResponse(WebSocketActions.USER_UPDATE, { user, state });
};

/* ----------------------------------------------------------------------------
 * Game Related Response
 * ------------------------------------------------------------------------- */

/**
 * Create GET_ALL_GAMES response object.
 * @param {Game[]} games a list of Game objects
 */
export const createWSAllGamesResponse = (games: Game[]): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GET_ALL_GAMES, { games });
};

/**
 * Create CREATE_GAME response object.
 * @param {Game} game game object
 */
export const createGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  return createWSResponse(WebSocketActions.CREATE_GAME, wsPayload);
};

/**
 * Create JOIN_GAME response object.
 * @param {Game} game game object
 */
export const createJoinGameResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  return createWSResponse(WebSocketActions.JOIN_GAME, wsPayload);
};

/**
 * Create LEAVE_GAME response object.
 * @param {Game} game game object
 */
export const createLeaveResponse = (game: Game | undefined): WebSocketResponse => {
  const wsPayload = game ? { game } : {};
  return createWSResponse(WebSocketActions.LEAVE_GAME, wsPayload);
};

/**
 * Create GAME_UPDATE response object.
 * @param {Game} game game object
 * @param {GameStates} state game state
 */
export const createGameUpdateResponse = (game: Game, state: GameStates): WebSocketResponse => {
  return createWSResponse(WebSocketActions.GAME_UPDATE, { game, state });
};

/**
 * Create IN_GAME_MESSAGE response object.
 * @param {string} message in game message
 */
export const createInGameMessageResponse = (message: string): WebSocketResponse => {
  return createWSResponse(WebSocketActions.IN_GAME_MESSAGE, { message });
};

/**
 * Create IN_GAME_UPDATE response object.
 * @param {User[]} users uses in the game
 */
export const createInGameUpdateResponse = (users: User[]): WebSocketResponse => {
  return createWSResponse(WebSocketActions.IN_GAME_UPDATE, { users });
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
 * Create LOGIN_SUCCESS response object.
 */
export const createLoginSuccessResponse = (): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
  return successWebSocketResponse(wsResponse);
};

/**
 * Create LOGIN_SUCCESS response object.
 * @param {string} errorMessage error message during login
 */
export const createLoginFailureResponse = (errorMessage: string): WebSocketResponse => {
  const wsResponse = createWSResponse(WebSocketActions.LOGIN_SUCCESS, {});
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
export const createWSMessageResponse = (username: string, message: string): WebSocketResponse => {
  const wsPayload = {
    username,
    message,
    time: new Date().toISOString(),
  };
  return createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
};
