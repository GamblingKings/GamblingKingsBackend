import { LambdaEventBodyPayloadOptions } from './payload';

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
  connectedAt?: string;
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
