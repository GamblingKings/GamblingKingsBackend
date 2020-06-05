import { ApiGatewayManagementApi, Request, AWSError } from 'aws-sdk';
import { WebSocketAPIGatewayEventRequestContext } from './types';

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

  send(msg: string, id?: string): Promise<unknown> {
    // If passed msg is object, it's parsed to JSON
    const parsedMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);

    console.log(`Sending ${parsedMsg} to ${id || this.connectionId}`);

    return new Promise((resolve, reject) => {
      this.ws.postToConnection(
        {
          ConnectionId: id || this.connectionId,
          Data: parsedMsg,
        },
        (err, data) => {
          if (err) {
            console.log('err is', err);
            reject(err);
          }

          resolve(data);
        },
      );
    });
  }
}
