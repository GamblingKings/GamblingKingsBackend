import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: 'localhost:8001',
    sslEnabled: false,
    region: 'local-env',
    // support empty string for attributes instead of converting them to undefined
    // see: https://aws.amazon.com/about-aws/whats-new/2020/05/amazon-dynamodb-now-supports-empty-values-for-non-key-string-and-binary-attributes-in-dynamodb-tables/
    convertEmptyValues: false,
  }),
};

export const ddb = new DocumentClient(config);
