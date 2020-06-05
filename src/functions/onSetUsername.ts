import { Handler } from 'aws-lambda';
import { setUserName } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse } from '../types';
import { response } from '../utils/response';

/**
 * Handler for setting username for a user (or connection).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload } = body;
  console.log('Payload', payload);
  const { username } = payload;

  console.log(`Setting username to ${username}...`);
  try {
    if (username) {
      await setUserName(connectionId, username);

      return response(200, `Set username to ${username}`);
    }

    return response(400, 'Username attribute cannot be empty');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
