import { DynamoDB } from 'aws-sdk';
export const DB = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
  // Uncomment for local dev only
  // region: 'localhost',
  // endpoint: 'http://localhost:8000'
});
