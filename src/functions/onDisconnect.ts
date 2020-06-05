import { Handler } from 'aws-lambda';
import { deleteConnection } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { response } from '../utils/response';

/**
 * Handler for websocket disconnect.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
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
