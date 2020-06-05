import { Handler } from 'aws-lambda';
import { saveConnection } from '../module/db';
import { WebSocketAPIGatewayEvent } from '../types';
import { response, LambdaResponse } from '../utils/response';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const { connectionId } = event.requestContext;

  console.log('Writing connectionId to the db table...');
  try {
    await saveConnection(connectionId);

    return response(200, 'Connection added successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
