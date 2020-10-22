import { Handler } from 'aws-lambda';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { LambdaResponse } from '../types/response';

/**
 * Default handler.
 */
export const handler: Handler = async (): Promise<LambdaResponse> => {
  Logger.createLogTitle('defaultMessage.ts');
  return response(200, 'Default message');
};
