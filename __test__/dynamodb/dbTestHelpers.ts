import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { CONNECTIONS_TABLE, GAMES_TABLE, GAME_STATE_TABLE } from '../../src/utils/constants';
import { ddb } from '../../src/dynamodb/jestLocalDynamoDB';
import { GameState } from '../../src/models/GameState';
import { getGameStateByGameId } from '../../src/dynamodb/gameStateDBService';

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

/*
 * Add new game state or replace existing game state with the same game id into GAME_STATE_TABLE.
 * Mainly to be used to easily add game states for testing purposes.
 * FOR USE IN TESTING ONLY.
 */
export const testReplaceGameState = async (newGameState: GameState): Promise<GameState | undefined> => {
  const putItemParm: DocumentClient.PutItemInput = {
    TableName: GAME_STATE_TABLE,
    Item: newGameState,
    ReturnValues: 'ALL_OLD',
  };

  await ddb.put(putItemParm).promise();
  return getGameStateByGameId(newGameState.gameId);
};
