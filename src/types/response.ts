import { LambdaEventBodyPayloadOptions } from './payload';
import { WebSocketActionsEnum } from '../enums/WebSocketActionsEnum';

/* ----------------------------------------------------------------------------
 * Lambda
 * ------------------------------------------------------------------------- */

/**
 * Response Header interface for Lambda functions
 */
export interface LambdaResponseHeader {
  'Content-Type': string;
  'Access-Control-Allow-Origin': string;
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

/* ----------------------------------------------------------------------------
 * WebSocket Response
 * ------------------------------------------------------------------------- */

/**
 * Websocket response type for the frontend client
 */
export interface WebSocketResponse {
  action: WebSocketActionsEnum;
  payload: LambdaEventBodyPayloadOptions;
}
