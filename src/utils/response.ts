export interface LambdaResponse {
  statusCode: number;
  body: string | string[];
  headers: LambdaResponseHeader;
  isBase64Encoded: boolean;
}

export interface LambdaResponseHeader {
  'Content-Type': string;
  'Access-Control-Allow-Origin': string;
}

export const response = (statusCode: number, message: string): LambdaResponse => {
  return {
    statusCode,
    body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    isBase64Encoded: false,
  };
};
