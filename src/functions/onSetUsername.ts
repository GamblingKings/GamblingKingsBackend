import { Handler } from 'aws-lambda';
import { setUserName } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse, LambdaEventBodyPayloadOptions } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';

/**
 * Handler for setting username for a user (or connection).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle(__filename);

  console.log('RequestContext', event.requestContext);
  const { connectionId } = event.requestContext;
  const body = JSON.parse(event.body) as LambdaEventBody;
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  console.log('Payload', payload);
  const { username } = body.payload;

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
