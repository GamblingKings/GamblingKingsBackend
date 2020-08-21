import { HongKongWall } from '../../../../src/games/mahjong/Wall/version/HongKongWall';
import { DEFAULT_HAND_LENGTH } from '../../../../src/utils/constants';
import { BonusTilesMapper } from '../../../../src/games/mahjong/Tile/map/TileMapper';

const DEFAULT_WALL_LENGTH = 144;

test('wall to have DEFAULT_WALL_LENGTH tiles when initialized', () => {
  const wall = new HongKongWall();
  expect(wall.getTiles()).toHaveLength(DEFAULT_WALL_LENGTH);
});

test('Generate hand will yield a hand of 13 tiles', () => {
  const wall = new HongKongWall();
  const hand = wall.generateHand();
  expect(hand).toHaveLength(DEFAULT_HAND_LENGTH);
});

test('Generate hand increment wall index by 13', () => {
  const wall = new HongKongWall();
  const hand = wall.generateHand();
  expect(hand).toHaveLength(DEFAULT_HAND_LENGTH);
  expect(wall.getCurrentTileIndex()).toBe(DEFAULT_HAND_LENGTH);
});

test('Generate hand will take tiles from the correct indexes', () => {
  const wall = new HongKongWall();

  // Call generate twice
  wall.generateHand();
  const hand = wall.generateHand();

  const tilesDrawn = [...wall.getTiles().slice(DEFAULT_HAND_LENGTH, DEFAULT_HAND_LENGTH * 2)];

  let same = true;

  for (let i = 0; i < hand.length; i += 1) {
    if (tilesDrawn[i] !== hand[i]) {
      same = false;
      break;
    }
  }

  expect(same).toBeTruthy();
});

test('Drawing from the wall increment index by 1', () => {
  const drawCount = 10;
  const wall = new HongKongWall();

  for (let i = 0; i < drawCount; i += 1) {
    wall.draw();
  }

  expect(wall.getCurrentTileIndex()).toBe(10);
});

test('able to rest the wall', () => {
  const wall = new HongKongWall();
  const originalWall = wall.getTiles();

  wall.reset();
  const newWall = wall.getTiles();

  expect(originalWall).toIncludeSameMembers(newWall);
  expect(originalWall).not.toStrictEqual(newWall);
});

describe('test getInitialTiles', () => {
  let wall: HongKongWall;

  beforeEach(() => {
    wall = new HongKongWall();
  });

  afterEach(() => {
    wall.reset();
  });

  test('it should get 13 tiles as initial hand and f/s in a separate array', () => {
    const initHand = wall.getInitialTiles();
    console.log(initHand);

    // Check length
    const { hand, bonusTiles } = initHand;
    expect(hand).toHaveLength(13);
    expect(bonusTiles.length >= 0).toBeTruthy();

    // Check bonus tiles in cleaned hand
    const allBonusTiles = Object.keys(BonusTilesMapper);
    hand.forEach((tile) => {
      expect(!allBonusTiles.includes(tile)).toBeTruthy();
    });

    // Check bonus tiles in bonusTiles array
    if (bonusTiles.length > 0) {
      bonusTiles.forEach((tile) => {
        expect(allBonusTiles.includes(tile)).toBeTruthy();
      });
    }
  });

  test('it can generator 4 hands with bonus tiles and set the index correctly', () => {
    const initHand1 = wall.getInitialTiles();
    const initHand2 = wall.getInitialTiles();
    const initHand3 = wall.getInitialTiles();
    const initHand4 = wall.getInitialTiles();

    // Check length
    const { hand: hand1, bonusTiles: bonusTiles1 } = initHand1;
    const { hand: hand2, bonusTiles: bonusTiles2 } = initHand2;
    const { hand: hand3, bonusTiles: bonusTiles3 } = initHand3;
    const { hand: hand4, bonusTiles: bonusTiles4 } = initHand4;

    const handsLength = hand1.length + hand2.length + hand3.length + hand4.length;
    const bonusTilesLength = bonusTiles1.length + bonusTiles2.length + bonusTiles3.length + bonusTiles4.length;
    const currentTileIndex = wall.getCurrentTileIndex();

    // Check number of tiles drawn with the current index
    expect(bonusTilesLength).toBeLessThan(8); // 4 types of flowers and seasons
    expect(currentTileIndex).toBe(handsLength + bonusTilesLength);
    expect(handsLength + bonusTilesLength).toBe(currentTileIndex);

    // Check initial hands with the wall
    const expectedUsedTiles = wall.getTiles().slice(0, currentTileIndex);
    const actualUsedTiles = [
      ...hand1,
      ...hand2,
      ...hand3,
      ...hand4,
      ...bonusTiles1,
      ...bonusTiles2,
      ...bonusTiles3,
      ...bonusTiles4,
    ];
    expect(expectedUsedTiles).toHaveLength(actualUsedTiles.length);
    expect(expectedUsedTiles).toStrictEqual(expect.arrayContaining(actualUsedTiles));
  });
});
