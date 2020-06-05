import { Handler } from 'aws-lambda';
import { createGame } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody } from '../types';
import { response, LambdaResponse } from '../utils/response';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const body: LambdaEventBody<string[]> = JSON.parse(event.body);
  const { payload } = body;

  console.log('Adding game to the db table...');
  console.log('Payload data', payload.data);
  console.log('Type of payload data', typeof payload.data);
  try {
    await createGame(payload.data);

    return response(200, 'Game created successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
