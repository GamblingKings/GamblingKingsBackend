import { Handler } from 'aws-lambda';
import { saveConnection } from '../../dynamodb/userDBService';
import { response } from '../../utils/responseHelper';
import { Logger } from '../../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';

/**
 * Handler for websocket connection.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onConnect.ts');

  const { connectionId } = event.requestContext;

  console.log('Writing connectionId to the db table...');
  try {
    // Add user to Connections Table
    await saveConnection(connectionId);

    return response(200, 'Connection added successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
