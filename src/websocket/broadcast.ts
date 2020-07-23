import { WebSocketClient } from './WebSocketClient';
import { getAllConnections, getUserByConnectionId } from '../dynamodb/userDBService';
import { getAllGames, getGameByGameId } from '../dynamodb/gameDBService';
import { User } from '../models/User';
import { Game } from '../models/Game';
import {
  createGameUpdateResponse,
  createInGameMessageResponse,
  createInGameUpdateResponse,
  createUserUpdateResponse,
  createGetAllGamesResponse,
  createGetAllUsersResponse,
  createSendMessageResponse,
  createGameStartResponse,
  createDrawTileResponse,
} from './createWSResponse';
import { getHandByConnectionId, removeDynamoDocumentVersion } from '../dynamodb/dbHelper';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates, UserStates } from '../types/states';
import { drawTile, initGameState } from '../dynamodb/gameStateDBService';

/* ----------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/**
 * Get connection Ids from a list of User objects.
 * @param {User[]} usersList users list
 */
export const getConnectionIdsFromUsers = (usersList: User[]): string[] => {
  return usersList.map((user) => user.connectionId);
};

/**
 * Filter out caller connection Id from a list of connection Ids.
 * @param {string} callerConnectionId caller connection Id
 * @param {string} connectionIds connection Ids
 */
export const getConnectionIdsExceptCaller = (callerConnectionId: string, connectionIds: string[]): string[] => {
  return connectionIds.filter((otherConnectionId) => otherConnectionId !== callerConnectionId);
};

/* ----------------------------------------------------------------------------
 * User
 * ------------------------------------------------------------------------- */

/**
 * Broadcast all the connections to a user.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} connectionId connection Id
 */
export const broadcastConnections = async (ws: WebSocketClient, connectionId: string): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();

  if (users && users.length > 0) {
    console.log('broadcastConnections, Connections:', users);

    // Create users response object
    const wsResponse = createGetAllUsersResponse({
      users,
    });

    // Send all the active connections to a user
    await ws.send(wsResponse, connectionId);
  }

  return users || [];
};

/**
 * Broadcast user update to every other user (except the one with connectionId specified in the argument)
 * @param {WebSocketClient} ws WebSocket client
 * @param {string} callerConnectionId connection Id
 * @param {UserStates} state user state
 * @param allConnectionIds connection ids from all the currently connected users
 */
export const broadcastUserUpdate = async (
  ws: WebSocketClient,
  callerConnectionId: string,
  state: UserStates,
  allConnectionIds: string[],
): Promise<User | undefined> => {
  const currentUser = await getUserByConnectionId(callerConnectionId);
  console.log('broadcastUserUpdate, User update:', currentUser);

  if (currentUser) {
    const wsResponse = createUserUpdateResponse({
      user: currentUser,
      state,
    });

    const otherConnectionIds = getConnectionIdsExceptCaller(callerConnectionId, allConnectionIds);
    await Promise.all(
      otherConnectionIds.map((otherConnectionId) => {
        return ws.send(wsResponse, otherConnectionId);
      }),
    );
  }

  return currentUser;
};

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */

/**
 * Broadcast all the currently active games to a user.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} connectionId connection Id
 */
export const broadcastGames = async (ws: WebSocketClient, connectionId: string): Promise<Game[] | []> => {
  const games = await getAllGames();
  games.forEach((game) => {
    // Remove document version on game object
    removeDynamoDocumentVersion<Game>(game);
  });

  console.log('broadcastGames, Games:', games);

  // Create games response object
  const wsResponse = createGetAllGamesResponse({
    games,
  });

  // Send all games each user
  await ws.send(wsResponse, connectionId);

  return games || [];
};

/**
 * Broadcast game update to all users except the game host
 * @param {WebSocketClient} ws WebSocket client
 * @param {string} gameId game Id
 * @param {GameStates} state of the game
 * @param {string} callerConnectionId caller's connection Id
 * @param {string[]} allConnectionIds connection ids from all the currently connected users
 * @param {boolean} sendToAll flag to whether sent to all users or not
 */
export const broadcastGameUpdate = async (
  ws: WebSocketClient,
  gameId: string,
  state: GameStates,
  callerConnectionId: string,
  allConnectionIds: string[],
  sendToAll = false,
): Promise<Game | undefined> => {
  // Get updated game info
  const updatedGame = await getGameByGameId(gameId);

  console.log('broadcastGameUpdate, Game update:', updatedGame);

  if (updatedGame) {
    // Remove document version on game object
    removeDynamoDocumentVersion<Game>(updatedGame);

    // Send game update to all other users (except the caller or the game creator)
    const wsResponse = createGameUpdateResponse({
      game: updatedGame,
      state,
    });

    let promises: Promise<unknown>[];
    if (sendToAll) {
      promises = allConnectionIds.map((connectionId) => {
        return ws.send(wsResponse, connectionId);
      });
    } else {
      const otherConnectionIds = getConnectionIdsExceptCaller(callerConnectionId, allConnectionIds);
      promises = otherConnectionIds.map((otherConnectionId) => {
        return ws.send(wsResponse, otherConnectionId);
      });
    }

    await Promise.all(promises);
  }

  return updatedGame;
};

/**
 * Broadcast a message about who is joining the game with the IN_GAME_MESSAGE action
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} callerConnectionId caller's connection Id
 * @param {WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME} action join or leave game action
 * @param {string[]} connectionIds connection Ids of all users who are in the same game
 * @param {string} callerUsername caller's username
 */
export const broadcastInGameMessage = async (
  ws: WebSocketClient,
  callerConnectionId: string,
  action: WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME,
  connectionIds: string[],
  callerUsername: string | undefined = undefined,
): Promise<void> => {
  let username: string;
  if (!callerUsername) {
    // For onLeaveGame and onJoinGame, need to get user's username
    const user = (await getUserByConnectionId(callerConnectionId)) as User;

    username = user.username || 'Unknown User'; // TODO: change to a more appropriate name
  } else {
    // For onDisconnect, need to provide username
    username = callerUsername;
  }

  // Format message
  const actionWord: string = action === WebSocketActions.JOIN_GAME ? 'joined' : 'left';
  const message = `${username || callerConnectionId} just ${actionWord} the game.`;
  console.log('broadcastInGameMessage, In game message:', message);

  // Send message to the other connectionIds that are already in the game
  const otherConnectionIds = connectionIds.filter((otherConnectionId) => otherConnectionId !== callerConnectionId);
  const wsResponse = createInGameMessageResponse(username, message);
  await Promise.all(
    otherConnectionIds.map((otherConnectionId) => {
      return ws.send(wsResponse, otherConnectionId);
    }),
  );
};

/**
 * Broadcast in game update about the current users list in the game
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} callerConnectionId caller's connection Id
 * @param {User[]} usersInGame current users list in the game
 */
export const broadcastInGameUpdate = async (
  ws: WebSocketClient,
  callerConnectionId: string,
  usersInGame: User[],
): Promise<User[]> => {
  console.log('broadcastInGameUpdate, Users in game:', usersInGame);

  // Send users list to the other connectionIds that are already in the game
  const otherConnectionIds = getConnectionIdsExceptCaller(callerConnectionId, getConnectionIdsFromUsers(usersInGame));
  const wsResponse = createInGameUpdateResponse({
    users: usersInGame,
  });
  await Promise.all(
    otherConnectionIds.map((otherConnectionId) => {
      return ws.send(wsResponse, otherConnectionId);
    }),
  );

  return usersInGame;
};

export const broadcastGameStart = async (ws: WebSocketClient, gameId: string, usersInGame: User[]): Promise<void> => {
  const connectionIds = getConnectionIdsFromUsers(usersInGame);
  const { hands } = await initGameState(gameId, connectionIds);

  const promises = connectionIds.map((connectionId) => {
    const tiles = getHandByConnectionId(hands, connectionId);

    // Put random tiles in response
    const wsResponse = createGameStartResponse({ tiles: JSON.stringify(tiles) });

    // Send tiles as a string to each user in the game
    return ws.send(wsResponse, connectionId);
  });

  await Promise.all(promises);
};

/* ----------------------------------------------------------------------------
 * Message
 * ------------------------------------------------------------------------- */

/**
 * Broadcast a message to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} username username of the user who send the message to all other users
 * @param {string} message message content
 */
export const broadcastMessage = async (
  ws: WebSocketClient,
  username: string,
  message: string,
): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();
  console.log('broadcastMessage, Connections:', users);

  if (users && users.length > 0) {
    const wsResponse = createSendMessageResponse({
      username,
      message,
    });

    // Send a message to all the active connections
    await Promise.all(
      users.map((connection) => {
        // Send all connections to all users
        return ws.send(wsResponse, connection.connectionId);
      }),
    );
  }

  return users || [];
};

/**
 * Broadcast a tile string to a user in the game.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} gameId game Id
 * @param {string} connectionId connection Id
 */
export const broadcastDrawTileToUser = async (
  ws: WebSocketClient,
  gameId: string,
  connectionId: string,
): Promise<string> => {
  const tileDrawn = await drawTile(gameId);
  console.log('tile drawn:', tileDrawn);

  const wsResponse = createDrawTileResponse({ tile: tileDrawn });
  await ws.send(wsResponse, connectionId);

  return tileDrawn;
};
