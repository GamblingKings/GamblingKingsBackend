import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

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
  users?: string[];
  games?: string[];
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
