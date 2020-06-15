import { User } from './models/User';
import { Game } from './models/Game';

/* ----------------------------------------------------------------------------
 * WebSocket Event
 * ------------------------------------------------------------------------- */

/**
 * Websocket Event RequestContext interface
 */
export interface WebSocketAPIGatewayEventRequestContext {
  connectionId: string;
  domainName: string;
  stage: string;
  connectedAt?: number;
}

/**
 * Websocket API Gateway Event interface
 */
export interface WebSocketAPIGatewayEvent {
  requestContext: WebSocketAPIGatewayEventRequestContext;
  body: string;
}

/**
 * Event body interface for Lambda functions
 */
export interface LambdaEventBody {
  action: string;
  payload: LambdaEventBodyPayloadOptions;
}

/* ----------------------------------------------------------------------------
 * WebSocket Payload
 * ------------------------------------------------------------------------- */

/**
 * Payload interface for Lambda event body
 */
export interface LambdaEventBodyPayloadOptions {
  username?: string;
  message?: string;
  user?: User;
  game?: Game;
  gameId?: string;
  users?: User[];
  games?: Game[];
  success?: boolean;
  error?: string;
  state?: string;
}

/* ----------------------------------------------------------------------------
 * WebSocket Response
 * ------------------------------------------------------------------------- */

/**
 * Response interface for Lambda functions
 */
export interface LambdaResponse {
  statusCode: number;
  body: string | string[];
  headers: LambdaResponseHeader;
  isBase64Encoded: boolean;
}

/**
 * Response Header interface for Lambda functions
 */
export interface LambdaResponseHeader {
  'Content-Type': string;
  'Access-Control-Allow-Origin': string;
}

/**
 * Websocket response type for the frontend client
 */
export interface WebSocketResponse {
  action: WebSocketActions;
  payload: LambdaEventBodyPayloadOptions;
}

export interface Message {
  message: string;
  sender: string;
  time: string;
}

/* ----------------------------------------------------------------------------
 * WebSocket Actions
 * ------------------------------------------------------------------------- */

/**
 *  Websocket action types enum
 */
export enum WebSocketActions {
  GET_ALL_GAMES = 'GET_ALL_GAMES',
  GET_ALL_USERS = 'GET_ALL_USERS',
  CREATE_GAME = 'CREATE_GAME',
  SEND_MESSAGE = 'SEND_MESSAGE',
  JOIN_GAME = 'JOIN_GAME',
  LEAVE_GAME = 'LEAVE_GAME',
  USER_UPDATE = 'USER_UPDATE',
  GAME_UPDATE = 'GAME_UPDATE',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
}

/* ----------------------------------------------------------------------------
 * States
 * ------------------------------------------------------------------------- */
export enum UserStates {
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
}

export enum GameStates {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
}
