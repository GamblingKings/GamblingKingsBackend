import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { CONNECTIONS_TABLE, GAMES_TABLE, GAME_STATE_TABLE } from '../../src/utils/constants';
import { GameState } from '../../src/models/GameState';
import { getGameStateByGameId } from '../../src/dynamodb/gameStateDBService';
import { DB } from '../../src/dynamodb/db';

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
    await DB.delete(deleteParam).promise();
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
    await DB.delete(deleteParam).promise();
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
  const putItemParam: DocumentClient.PutItemInput = {
    TableName: GAME_STATE_TABLE,
    Item: newGameState,
    ReturnValues: 'ALL_OLD',
  };

  await DB.put(putItemParam).promise();
  return getGameStateByGameId(newGameState.gameId);
};
