import { Handler } from 'aws-lambda';
import { setUsername } from '../dynamodb/userDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../websocket/WebSocketClient';
import { createLoginFailureResponse, createLoginSuccessResponse } from '../websocket/createWSResponse';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse, WebSocketResponse } from '../types/response';

/**
 * Handler for setting username for a user (or connection).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // Logger
  Logger.createLogTitle('onSetUsername.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body = JSON.parse(event.body) as LambdaEventBody;
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const { username } = payload;

  // Set username
  console.log(`Setting username to ${username}...`);
  const ws = new WebSocketClient(event.requestContext);
  try {
    if (username) {
      await setUsername(connectionId, username);
      const wsResponse: WebSocketResponse = createLoginSuccessResponse();
      await ws.send(wsResponse, connectionId);

      return response(200, `Set username to ${username}`);
    }

    return response(400, 'Username attribute cannot be empty');
  } catch (err) {
    console.error(JSON.stringify(err));
    const wsResponse = createLoginFailureResponse(JSON.stringify(err));
    await ws.send(wsResponse, connectionId);

    return response(500, err);
  }
};
