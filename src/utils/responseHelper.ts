import { LambdaResponse } from '../types/response';

/**
 * Return an object as lambda function response.
 * @param {number} statusCode status code
 * @param {string} message response message
 */
export const response = (statusCode: number, message: string): LambdaResponse => {
  return {
    statusCode,
    body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    isBase64Encoded: false,
  };
};
