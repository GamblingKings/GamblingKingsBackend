import { initGameState } from '../../../module/dynamodb/gameStateDBService';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  FAKE_CONNECTION_ID4,
  FAKE_GAME_ID,
} from '../../testConstants';
import { DEFAULT_MAX_USERS_IN_GAME } from '../../../constants';

const CONNECTION_IDS = [FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID2, FAKE_CONNECTION_ID3, FAKE_CONNECTION_ID4];
const MAX_WALL_LENGTH = 144;
const DEFAULT_HAND_LENGTH = 13;

describe('test initGameState', () => {
  test('it should init a game with a wall and 4 hands to users', async () => {
    const response = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);

    // Test game Id and remaining tiles in the wall
    const { gameId, wall, hands } = response;
    expect(gameId).toBe(FAKE_GAME_ID);
    const remainingWallLength = MAX_WALL_LENGTH - DEFAULT_HAND_LENGTH * DEFAULT_MAX_USERS_IN_GAME;
    expect(wall.getTiles()).toHaveLength(remainingWallLength);

    // Test hands
    const [hand1, hand2, hand3, hand4] = hands;

    expect(hand1.connectionId).toBe(FAKE_CONNECTION_ID1);
    expect(JSON.parse(hand1.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand2.connectionId).toBe(FAKE_CONNECTION_ID2);
    expect(JSON.parse(hand2.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand3.connectionId).toBe(FAKE_CONNECTION_ID3);
    expect(JSON.parse(hand3.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand4.connectionId).toBe(FAKE_CONNECTION_ID4);
    expect(JSON.parse(hand4.hand)).toHaveLength(DEFAULT_HAND_LENGTH);
  });
});
