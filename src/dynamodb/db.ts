import { DynamoDB } from 'aws-sdk';
import { ddb } from '../__test__/jestLocalDynamoDB';

/* ----------------------------------------------------------------------------
 * DocumentClient
 * ------------------------------------------------------------------------- */
/**
 * Default DynamoDB DocumentClient options
 */
const DEFAULT_OPTION = {
  apiVersion: '2012-08-10',
  // support empty string for attributes instead of converting them to undefined
  // see: https://aws.amazon.com/about-aws/whats-new/2020/05/amazon-dynamodb-now-supports-empty-values-for-non-key-string-and-binary-attributes-in-dynamodb-tables/
  convertEmptyValues: false,
};

/**
 * Create a DynamoDB DocumentClient instance
 */
export const getDynamoDocumentClient = (): DynamoDB.DocumentClient => {
  // For local dev using serverless
  if (process.env.IS_OFFLINE) {
    return new DynamoDB.DocumentClient({
      ...DEFAULT_OPTION,
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  }

  // For testing using jest-dynalite
  if (process.env.MOCK_DYNAMODB_ENDPOINT) {
    return ddb;
  }

  // For prod
  return new DynamoDB.DocumentClient({
    ...DEFAULT_OPTION,
    region: 'us-west-2',
  });
};

/**
 * Export DynamoDB DocumentClient instance
 */
export const DB = getDynamoDocumentClient();
