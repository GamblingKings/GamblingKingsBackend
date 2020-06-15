import { Handler } from 'aws-lambda';
import { setUsername } from '../module/db';
import {
  WebSocketAPIGatewayEvent,
  LambdaEventBody,
  LambdaResponse,
  LambdaEventBodyPayloadOptions,
  WebSocketResponse,
} from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createLoginFailureResponse, createLoginSuccessResponse } from '../utils/webSocketActions';

/**
 * Handler for setting username for a user (or connection).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // Logger
  Logger.createLogTitle('onSetUsername.ts');

  // Parse event
  console.log('RequestContext', event.requestContext);
  const { connectionId } = event.requestContext;
  const body = JSON.parse(event.body) as LambdaEventBody;
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  console.log('Payload', payload);
  const { username } = payload;

  // Set username
  console.log(`Setting username to ${username}...`);
  const ws = new WebSocketClient(event.requestContext);
  try {
    if (username) {
      await setUsername(connectionId, username);
      const res: WebSocketResponse = createLoginSuccessResponse();
      await ws.send(JSON.stringify(res), connectionId);

      return response(200, `Set username to ${username}`);
    }

    return response(400, 'Username attribute cannot be empty');
  } catch (err) {
    console.error(err);
    const res: WebSocketResponse = createLoginFailureResponse(err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, err);
  }
};
