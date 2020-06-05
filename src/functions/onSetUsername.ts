// eslint-disable-next-line import/no-unresolved
import { Handler } from 'aws-lambda';
import { setUserName } from '../module/db';
import { WebSocketAPIGatewayEvent } from '../types';
import { response, LambdaResponse } from '../utils/response';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const { connectionId } = event.requestContext;
  const { payload } = JSON.parse(event.body);
  console.log('PAYLOAD', payload);
  const { username } = payload;

  try {
    await setUserName(connectionId, username);

    return response(200, `Set username to ${username}`);
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
