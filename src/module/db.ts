import { DynamoDB, AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { PromiseResult } from 'aws-sdk/lib/request';
import { CONNECTIONS_TABLE } from '../constants';

type DynamoDBResponse<T> = PromiseResult<T, AWSError>;

export const DB = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  // ////////////////////////////////////
  // Uncomment for local dev only
  // ////////////////////////////////////
  // region: 'localhost',
  // endpoint: 'http://localhost:8000',
});

export const saveConnection = async (connectionId: string): Promise<DynamoDBResponse<DocumentClient.PutItemOutput>> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
  };

  return DB.put(putParams).promise();
};

export const deleteConnection = async (
  connectionId: string,
): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  return DB.delete(deleteParams).promise();
};

export const setUserName = async (
  connectionId: string,
  username: string,
): Promise<DynamoDBResponse<DocumentClient.UpdateItemOutput>> => {
  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    ExpressionAttributeNames: { '#usernameKey': 'username' },
    UpdateExpression: 'set #usernameKey = :usernameVal',
    ExpressionAttributeValues: {
      ':usernameVal': username,
    },
  };

  return DB.update(updateParams).promise();
};

export const getAllConnections = async (): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
  };

  return DB.scan(scanParams).promise();
};
