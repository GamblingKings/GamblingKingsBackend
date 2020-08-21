import { WebSocketClient } from '../WebSocketClient';
import { Game } from '../../models/Game';
import { getAllGames, getGameByGameId } from '../../dynamodb/gameDBService';
import { getHandByConnectionId, removeDynamoDocumentVersion } from '../../dynamodb/dbHelper';
import {
  createDrawTileResponse,
  createGameStartResponse,
  createGameUpdateResponse,
  createGetAllGamesResponse,
  createInGameMessageResponse,
  createInGameUpdateResponse,
  createPlayTileResponse,
  createWinningTilesResponse,
  createUpdateGameStateResponse,
  createSelfPlayTileResponse,
} from '../createWSResponse';
import { GameStatesEnum } from '../../enums/states';
import { WebSocketActionsEnum } from '../../enums/WebSocketActionsEnum';
import { getUserByConnectionId } from '../../dynamodb/userDBService';
import { User } from '../../models/User';
import { drawTile, initGameState } from '../../dynamodb/gameStateDBService';
import { getConnectionIdsExceptCaller, getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { GameState, SelfPlayedTile, UserHand } from '../../models/GameState';
import { SelfPlayTilePayload } from '../../types/payload';
import { HandPointResults } from '../../games/mahjong/types/MahjongTypes';

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
 * @param {GameStatesEnum} state of the game
 * @param {string} callerConnectionId caller's connection Id
 * @param {string[]} allConnectionIds connection ids from all the currently connected users
 * @param {boolean} sendToAll flag to whether sent to all users or not
 */
export const broadcastGameUpdate = async (
  ws: WebSocketClient,
  gameId: string,
  state: GameStatesEnum,
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
 * @param {WebSocketActionsEnum.JOIN_GAME | WebSocketActionsEnum.LEAVE_GAME} action join or leave game action
 * @param {string[]} connectionIds connection Ids of all users who are in the same game
 * @param {string} callerUsername caller's username
 */
export const broadcastInGameMessage = async (
  ws: WebSocketClient,
  callerConnectionId: string,
  action: WebSocketActionsEnum.JOIN_GAME | WebSocketActionsEnum.LEAVE_GAME,
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
  const actionWord: string = action === WebSocketActionsEnum.JOIN_GAME ? 'joined' : 'left';
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

/**
 * Broadcast initial hands to users when game pages are all loaded on the client side.
 * 1. If a new game is started, use initGameState function to add a new row to game state
 * 2. If a new round is started (within the same game), use the gameState passed in via arguments
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} gameId Game Id
 * @param {string[]} connectionIds All connection Ids in a game
 * @param {boolean} startNewGame Starting a new game or not
 * @param {GameState} gameState New gameState of a game
 */
export const broadcastGameStart = async (
  ws: WebSocketClient,
  gameId: string,
  connectionIds: string[],
  startNewGame: boolean,
  gameState?: GameState,
): Promise<void> => {
  let hands: UserHand[];
  let currentIndex: number;

  // For starting a new game
  if (startNewGame) {
    const newGameState = await initGameState(gameId, connectionIds);
    hands = newGameState.hands;
    currentIndex = newGameState.currentIndex;
  } else if (!startNewGame && gameState) {
    // For starting a new round in a game
    hands = gameState.hands;
    currentIndex = gameState.currentIndex;
  } else {
    // Error
    throw Error('broadcastGameStart: Failed to start a new game, please double check params passed in');
  }

  // Get self played tiles from all users in the game
  const allSelfPlayedTilesAtStart = hands.map((hand) => {
    return {
      connectionId: hand.connectionId,
      playedTiles: hand.playedTiles,
    };
  }) as SelfPlayedTile[];

  const promises = connectionIds.map((connectionId) => {
    const { hand: tiles } = getHandByConnectionId(hands, connectionId);

    // Put random tiles in response
    const wsResponse = createGameStartResponse({
      tiles,
      selfPlayedTiles: allSelfPlayedTilesAtStart,
      currentIndex,
    });
    // Send tiles as a string to each user in the game
    return ws.send(wsResponse, connectionId);
  });

  await Promise.all(promises);
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

/**
 * Broadcast a tile string that is discarded by a user to all users in the game.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} tile tile discarded by a user
 * @param callerConnectionId caller's connection Id
 * @param {string[]} connectionIds connectionIds connection Ids of all users who are in the same game
 */
export const broadcastPlayedTileToUsers = async (
  ws: WebSocketClient,
  tile: string,
  callerConnectionId: string,
  connectionIds: string[],
): Promise<string> => {
  const wsResponse = createPlayTileResponse({
    connectionId: callerConnectionId,
    tile,
  });

  await Promise.all(
    connectionIds.map((connectionId) => {
      return ws.send(wsResponse, connectionId);
    }),
  );

  return tile;
};

/**
 * Broadcast who won game and their winning tiles to all users in game
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string[]} connectionIds connection ids of all users
 * @param {string} connectionId connectionId of winner
 * @param {HandPointResults} handPointResults A winning hand with tiles and points
 */
export const broadcastWinningTiles = async (
  ws: WebSocketClient,
  connectionIds: string[],
  connectionId: string,
  handPointResults: HandPointResults,
): Promise<void> => {
  const wsResponse = createWinningTilesResponse({
    connectionId,
    handPointResults,
  });
  await Promise.all(connectionIds.map((cid) => ws.send(wsResponse, cid)));
};

/**
 * Broadcast updated game state after game round ends
 * @param {WebSocketClient} ws WebSocketClient instance
 * @param {string[]} connectionIds connectionIds of all users in game
 * @param {number} dealer current dealer
 * @param {number} wind current wind
 */
export const broadcastUpdateGameState = async (
  ws: WebSocketClient,
  connectionIds: string[],
  dealer: number,
  wind: number,
): Promise<void> => {
  const wsResponse = createUpdateGameStateResponse({
    dealer,
    wind,
  });
  await Promise.all(connectionIds.map((cid) => ws.send(wsResponse, cid)));
};

/**
 * Broadcast new hands to all users and Resets game round
 * @param {WebSocketClient} ws WebSocketClient instance
 * @param {string[]} connectionIds All user connection ids in a game
 * @param {GameState} gameState Game state
 */
export const broadcastGameReset = async (
  ws: WebSocketClient,
  connectionIds: string[],
  gameState: GameState,
): Promise<void> => {
  await broadcastGameStart(ws, '', connectionIds, true, gameState);
};

export const broadcastSelfPlayTile = async (
  ws: WebSocketClient,
  connectionIds: string[],
  payload: SelfPlayTilePayload,
): Promise<void> => {
  const wsResponse = createSelfPlayTileResponse(payload);
  await Promise.all(connectionIds.map((cid) => ws.send(wsResponse, cid)));
};
