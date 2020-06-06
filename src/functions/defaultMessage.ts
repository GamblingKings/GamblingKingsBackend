import { Handler } from 'aws-lambda';
import { response } from '../utils/response';
import { LambdaResponse, WebSocketAPIGatewayEvent } from '../types';
import { Logger } from '../utils/Logger';

/**
 * Default handler.
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle(__filename);

  console.log('Event requestContext:', event.requestContext);
  console.log('Event body:', event.body);
  return response(200, 'Default message');
};
