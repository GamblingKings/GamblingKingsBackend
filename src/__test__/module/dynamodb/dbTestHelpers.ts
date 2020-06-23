import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../../../constants';
import { ddb } from '../../jestLocalDynamoDB';

/* ----------------------------------------------------------------------------
 * Helper functions
 * ------------------------------------------------------------------------- */
export const cleanupTestUser = async (connectionId: string): Promise<void> => {
  const deleteParam: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  try {
    await ddb.delete(deleteParam).promise();
  } catch (err) {
    console.log(`User "${connectionId}" does not exist`);
  }
};

export const cleanupTestGame = async (gameId: string): Promise<void> => {
  const deleteParam: DocumentClient.DeleteItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
  };

  try {
    await ddb.delete(deleteParam).promise();
  } catch (err) {
    console.log(`Game "${gameId}" does not exist`);
  }
};
