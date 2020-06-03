import { DynamoDB } from 'aws-sdk';

const DB = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  // Uncomment for local dev only
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

export default DB;
