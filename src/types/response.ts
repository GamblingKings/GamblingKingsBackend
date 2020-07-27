import { LambdaEventBodyPayloadOptions } from './payload';
import { WebSocketActions } from '../enums/WebSocketActions';

/* ----------------------------------------------------------------------------
 * Lambda
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

/* ----------------------------------------------------------------------------
 * WebSocket Response
 * ------------------------------------------------------------------------- */

/**
 * Websocket response type for the frontend client
 */
export interface WebSocketResponse {
  action: WebSocketActions;
  payload: LambdaEventBodyPayloadOptions;
}
