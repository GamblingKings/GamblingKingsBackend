import { ApiGatewayManagementApi } from 'aws-sdk';
import { WebSocketAPIGatewayEventRequestContext } from './types';

const getApiGatewayManagementApiEndpoint = (
  requestContext: WebSocketAPIGatewayEventRequestContext,
  localhostUrl: string,
): string => {
  return process.env.IS_OFFLINE || !requestContext
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

  async send(msg: string | string[], id?: string): Promise<unknown> {
    // If passed msg is object, it's parsed to JSON
    const parsedMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);

    const connectionId = id || this.connectionId;
    console.log(`Sending ${parsedMsg} to ${connectionId}`);

    try {
      const postToConnectionRequest = {
        ConnectionId: connectionId,
        Data: parsedMsg,
      };
      console.log('PostToConnectionRequest:', postToConnectionRequest);
      await this.ws.postToConnection(postToConnectionRequest).promise();

      return null;
    } catch (err) {
      console.error(err);

      // 410: indicates that the client is no longer available.
      // 504: the request timed out (usually after 30 seconds),
      if (err.statusCode === 410 || err.statusCode === 504) {
        console.log(`Found stale connection: ${connectionId}`);
        return connectionId;
      }

      console.log(`Failed to send message to ${connectionId}. Error: ${JSON.stringify(err)}`);
      throw err;
    }
  }
}
