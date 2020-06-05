import { Handler } from 'aws-lambda';
import { response, LambdaResponse } from '../utils/response';

export const handler: Handler = async (): Promise<LambdaResponse> => {
  return response(200, 'Default message');
};
