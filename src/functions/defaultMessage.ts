import { Handler } from 'aws-lambda';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';

/**
 * Default handler.
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('defaultMessage.ts');

  console.log('Event requestContext:', event.requestContext);
  console.log('Event body:', event.body);
  return response(200, 'Default message');
};
