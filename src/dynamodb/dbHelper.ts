import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { HasVersion } from '../models/Version';
import { UserHand } from '../models/GameState';

/**
 * Remove version attribute from a Game object.
 * @param obj
 */
export const removeDynamoDocumentVersion = <T extends HasVersion>(obj: T): T => {
  const updatedObj = obj;
  if (updatedObj.version) delete updatedObj.version;
  return updatedObj;
};

/**
 * Parse ScanOutput and get Items list.
 * @param {DocumentClient.ScanOutput} response
 */
export const parseDynamoDBItemList = <T>(response: DocumentClient.ScanOutput): T[] => {
  const items = response.Items as DocumentClient.ItemList;
  if (items && items.length > 0) return items as T[];
  return [];
};

/**
 * Parse GetItemOutput and get Item.
 * @param {DocumentClient.GetItemOutput} response
 */
export const parseDynamoDBItem = <T>(response: DocumentClient.GetItemOutput): T | undefined => {
  const item = response.Item as DocumentClient.AttributeMap;
  if (item) return item as T;
  return undefined;
};

/**
 * Parse UpdateItemOutput or DeleteItemOutput and get Attributes map.
 * @param {DocumentClient.UpdateItemOutput | DocumentClient.DeleteItemOutput} response
 */
export const parseDynamoDBAttribute = <T>(
  response: DocumentClient.UpdateItemOutput | DocumentClient.DeleteItemOutput,
): T | undefined => {
  const attributes = response.Attributes as DocumentClient.AttributeMap;
  if (!attributes || attributes === {}) return undefined;
  return attributes as T;
};

export const getHandByConnectionId = (hands: UserHand[], connectionId: string): string[] => {
  const userHand = hands.find((hand) => {
    return hand.connectionId === connectionId;
  }) as UserHand;

  return userHand.hand;
};
