import { Handler } from 'aws-lambda';
import { deleteConnection } from '../module/db';
import { WebSocketAPIGatewayEvent } from '../types';
import { response, LambdaResponse } from '../utils/response';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const { connectionId } = event.requestContext;

  console.log('Deleting connectionId from the db table...');
  try {
    await deleteConnection(connectionId);

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
