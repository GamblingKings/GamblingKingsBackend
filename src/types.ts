import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';
import { User } from './models/User';
import { Game } from './models/Game';

/**
 * Websocket Event RequestContext interface
 */
export interface WebSocketAPIGatewayEventRequestContext extends APIGatewayEventRequestContext {
  connectionId: string;
  connectedAt: number;
  domainName: string;
  stage: string;
}

/**
 * Websocket API Gateway Event interface
 */
export interface WebSocketAPIGatewayEvent extends APIGatewayEvent {
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

/**
 * Payload interface for Lambda event body
 */
export interface LambdaEventBodyPayloadOptions {
  username?: string;
  message?: string;
  game?: Game;
  users?: User[];
  games?: Game[];
}

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

/**
 *  Websocket action types enum
 */
export enum WebSocketActions {
  GET_ALL_GAMES = 'GET_ALL_GAMES',
  GET_ALL_USERS = 'GET_ALL_USERS',
  CREATE_GAME = 'CREATE_GAME',
  SEND_MESSAGE = 'SEND_MESSAGE',
}
