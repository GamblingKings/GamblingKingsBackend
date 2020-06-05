import { ApiGatewayManagementApi } from 'aws-sdk';
import { WebSocketAPIGatewayEventRequestContext } from './types';

/**
 * Websocket client.
 */
export class WebSocketClient {
  private ws: ApiGatewayManagementApi;

  private connectionId: string;

  constructor(requestContext: WebSocketAPIGatewayEventRequestContext) {
    this.ws = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: `https://${requestContext.domainName}/${requestContext.stage}`,
      // ////////////////////////////////////
      // Change endpoint to this for local dev only
      // ////////////////////////////////////
      // endpoint: 'http://localhost:3001',
    });
    this.connectionId = requestContext.connectionId;
  }

  async send(msg: string | string[], id?: string): Promise<unknown> {
    // If passed msg is object, it's parsed to JSON
    const parsedMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);

    console.log(`Sending ${parsedMsg} to ${id || this.connectionId}`);

    return this.ws
      .postToConnection({
        ConnectionId: id || this.connectionId,
        Data: parsedMsg,
      })
      .promise();
  }
}
