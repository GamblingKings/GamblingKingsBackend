import { Handler } from 'aws-lambda';
import { response } from '../utils/response';
import { LambdaResponse, WebSocketAPIGatewayEvent } from '../types';

/**
 * Default handler.
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('Event requestContext:', event.requestContext);
  console.log('Event body:', event.body);
  return response(200, 'Default message');
};
