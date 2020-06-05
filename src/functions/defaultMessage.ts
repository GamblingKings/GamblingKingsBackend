import { Handler } from 'aws-lambda';
import { response } from '../utils/response';
import { LambdaResponse } from '../types';

/**
 * Default handler.
 */
export const handler: Handler = async (): Promise<LambdaResponse> => {
  return response(200, 'Default message');
};
