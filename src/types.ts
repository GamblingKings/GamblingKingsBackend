import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

export interface WebSocketAPIGatewayEventRequestContext extends APIGatewayEventRequestContext {
  connectionId: string;
  connectedAt: number;
  domainName: string;
  stage: string;
}

export interface WebSocketAPIGatewayEvent extends APIGatewayEvent {
  requestContext: WebSocketAPIGatewayEventRequestContext;
  body: string;
}

export interface LambdaEventBody<T> {
  action: string;
  payload: {
    data: T;
  };
}
