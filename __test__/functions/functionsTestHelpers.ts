import { WebSocketAPIGatewayEvent, WebSocketAPIGatewayEventRequestContext } from '../../src/types/event';

/* ----------------------------------------------------------------------------
 * Interface
 * ------------------------------------------------------------------------- */
interface CreateEventParams {
  eventBodyJSON: unknown;
  connectionId?: string;
  domainName?: string;
  stage?: string;
}

/* ----------------------------------------------------------------------------
 * Lambda event
 * ------------------------------------------------------------------------- */
export const createRequestContext = (
  connectionId: string,
  domainName: string,
  stage: string,
): WebSocketAPIGatewayEventRequestContext => {
  return {
    connectionId,
    domainName,
    stage,
    connectedAt: new Date().toISOString(),
  };
};

export const createEvent = ({
  eventBodyJSON,
  connectionId = 'test-id',
  domainName = 'test-domain-name',
  stage = 'dev',
}: CreateEventParams): WebSocketAPIGatewayEvent => {
  return {
    requestContext: createRequestContext(connectionId, domainName, stage),
    body: JSON.stringify(eventBodyJSON),
  };
};
