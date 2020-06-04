import { DynamoDB } from 'aws-sdk';

// ////////////////////////////////////
// Uncomment for local dev only
// ////////////////////////////////////
// import * as dotenv from 'dotenv';
// dotenv.config();

interface DynamoDBOption {
  apiVersion: string;
  region?: string;
  endpoint?: string;
}

const getDefaultOptions = (): DynamoDBOption => {
  const fixedOption = { apiVersion: '2012-08-10' };

  // For local
  if (process.env.ENVIRONMENT && process.env.ENVIRONMENT === 'local') {
    return {
      ...fixedOption,
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    };
  }

  // For prod
  return fixedOption;
};

const DB = new DynamoDB.DocumentClient(getDefaultOptions());

export default DB;
