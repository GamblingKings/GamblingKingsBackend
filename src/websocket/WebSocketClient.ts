import { ApiGatewayManagementApi } from 'aws-sdk';
import { WebSocketAPIGatewayEventRequestContext } from '../types/event';
import { WebSocketResponse } from '../types/response';

const getApiGatewayManagementApiEndpoint = (
  requestContext: WebSocketAPIGatewayEventRequestContext,
  localhostUrl: string,
): string => {
  return process.env.IS_OFFLINE || process.env.MOCK_DYNAMODB_ENDPOINT
    ? localhostUrl // For local dev
    : `https://${requestContext.domainName}/${requestContext.stage}`; // For prod
};

/**
 * Websocket client.
 */
export class WebSocketClient {
  public ws: ApiGatewayManagementApi;

  private readonly connectionId: string;

  constructor(requestContext: WebSocketAPIGatewayEventRequestContext, localhostUrl = 'http://localhost:3001') {
    this.ws = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: getApiGatewayManagementApiEndpoint(requestContext, localhostUrl),
    });
    this.connectionId = requestContext ? requestContext.connectionId : '';
  }

  /**
   * Send websocket response or message to user by connection id.
   * @param {WebSocketResponse | string} msg response (or message) content
   * @param {string} id connection id
   */
  async send(msg: WebSocketResponse | string, id?: string): Promise<unknown> {
    // If passed msg is object, it's parsed to JSON
    const parsedMsg: string = typeof msg !== 'string' ? JSON.stringify(msg) : msg;

    const connectionId = id || this.connectionId;

    try {
      const postToConnectionRequest = {
        ConnectionId: connectionId,
        Data: parsedMsg,
      };
      await this.ws.postToConnection(postToConnectionRequest).promise();

      return null;
    } catch (err) {
      // 410: indicates that the client is no longer available.
      // 504: the request timed out (usually after 30 seconds),
      if (err.statusCode === 410 || err.statusCode === 504) {
        return connectionId;
      }

      throw err;
    }
  }
}
