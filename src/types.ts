// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent, APIGatewayEventRequestContext } from 'aws-lambda';

export interface WebSocketAPIGatewayEventRequestContext extends APIGatewayEventRequestContext {
  connectionId: string;
  connectedAt: number;
}

export interface WebSocketAPIGatewayEvent extends APIGatewayEvent {
  requestContext: WebSocketAPIGatewayEventRequestContext;
  body: string;
}

export interface LambdaEventBody {
  action: string;
  payload: {
    data: string;
  };
}
