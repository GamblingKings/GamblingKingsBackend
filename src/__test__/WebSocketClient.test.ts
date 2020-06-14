import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

import { PostToConnectionRequest } from 'aws-sdk/clients/apigatewaymanagementapi';
import { WebSocketClient } from '../WebSocketClient';
import { WebSocketAPIGatewayEventRequestContext } from '../types';

const FAKE_CONNECTION_ID = 'FAKE_ID';
const LOCALHOST_URL = 'ws://localhost:1234';
const MOCK_REQUEST_CONTEXT: WebSocketAPIGatewayEventRequestContext = {
  connectionId: FAKE_CONNECTION_ID,
  domainName: 'fake domain name',
  stage: 'dev',
};
const FAKE_MESSAGE = 'Fake message';

beforeEach(() => {
  AWS.config.update({ region: 'localhost' });
  AWSMock.setSDKInstance(AWS);
});

afterEach(() => {
  AWSMock.restore('ApiGatewayManagementApi');
  expect.hasAssertions();
});

test('It returns null if it succeeds', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  AWSMock.mock('ApiGatewayManagementApi', 'postToConnection', (params: PostToConnectionRequest, callback: Function) => {
    callback(null, {});
  });
  const apiGatewayManagementApi = new WebSocketClient(MOCK_REQUEST_CONTEXT, LOCALHOST_URL);

  const result = await apiGatewayManagementApi.send(FAKE_MESSAGE, FAKE_CONNECTION_ID);
  expect(result).toBeNull();
});
