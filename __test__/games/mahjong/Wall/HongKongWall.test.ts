import { Wall } from '../../../../src/games/mahjong/Wall/Wall';
import { HongKongWall } from '../../../../src/games/mahjong/Wall/version/HongKongWall';
import { DEFAULT_HAND_LENGTH } from '../../../../src/utils/constants';
import { BonusTilesMapper } from '../../../../src/games/mahjong/Tile/map/TileMapper';

test('wall to have DEFAULT_WALL_LENGTH tiles when initialized', () => {
  const wall = new HongKongWall();
  expect(wall.getTiles()).toHaveLength(Wall.DEFAULT_WALL_LENGTH);
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

  test('Drawing multiple flowers in initial hand', () => {
    const testHand1 = [
      '1_FLOWER',
      '1_DOT',
      '2_DOT',
      '3_DOT',
      '4_DOT',
      '5_DOT',
      '6_DOT',
      '7_DOT',
      '8_DOT',
      '9_DOT',
      '1_BAMBOO',
      '2_BAMBOO',
      '3_BAMBOO',
    ];

    const testHand2 = [
      '2_FLOWER',
      '3_FLOWER',
      '4_BAMBOO',
      '5_BAMBOO',
      '6_BAMBOO',
      '7_BAMBOO',
      '8_BAMBOO',
      '9_BAMBOO',
      '1_CHARACTER',
      '2_CHARACTER',
      '3_CHARACTER',
      '4_CHARACTER',
      '5_CHARACTER',
    ];

    const testHand3 = [
      '6_CHARACTER',
      '7_CHARACTER',
      '8_CHARACTER',
      '9_CHARACTER',
      'EAST',
      'EAST',
      'EAST',
      'EAST',
      'WEST',
      'WEST',
      'WEST',
      'WEST',
      'NORTH',
    ];

    const testHand4 = [
      'NORTH',
      'NORTH',
      'NORTH',
      'SOUTH',
      'SOUTH',
      'SOUTH',
      'SOUTH',
      'REDDRAGON',
      'REDDRAGON',
      'REDDRAGON',
      'REDDRAGON',
      'WHITEDRAGON',
      'WHITEDRAGON',
    ];
    const testExtraTiles = ['4_FLOWER', '3_SEASON', '1_DOT', '4_SEASON', '2_DOT', '3_DOT'];

    const testWall = [
      // Hand 1 (1 bonus tiles)
      ...testHand1,
      // Hand 2 (2 bonus tiles)
      ...testHand2,
      // Hand 3 (No bonus tile)
      ...testHand3,
      // Hand 4 (No bonus tile)
      ...testHand4,
      // Extra tiles
      ...testExtraTiles,
    ];

    wall.setTiles(testWall);

    const initHand1 = wall.getInitialTiles();
    const initHand2 = wall.getInitialTiles();
    const initHand3 = wall.getInitialTiles();
    const initHand4 = wall.getInitialTiles();

    // Check length
    const { hand: hand1, bonusTiles: bonusTiles1 } = initHand1;
    const { hand: hand2, bonusTiles: bonusTiles2 } = initHand2;
    const { hand: hand3, bonusTiles: bonusTiles3 } = initHand3;
    const { hand: hand4, bonusTiles: bonusTiles4 } = initHand4;

    expect(hand1).toStrictEqual([...testHand1.slice(1, 13), testHand2[2]]);
    expect(bonusTiles1).toStrictEqual([testHand1[0], testHand2[0], testHand2[1]]);

    expect(hand2).toStrictEqual([...testHand2.slice(3, 13), ...testHand3.slice(0, 3)]);
    expect(bonusTiles2).toStrictEqual([]);

    expect(hand3).toStrictEqual([...testHand3.slice(3, 13), ...testHand4.slice(0, 3)]);
    expect(bonusTiles3).toStrictEqual([]);

    expect(hand4).toStrictEqual([...testHand4.slice(3, 13), testExtraTiles[2], testExtraTiles[4], testExtraTiles[5]]);
    expect(bonusTiles4).toStrictEqual([testExtraTiles[0], testExtraTiles[1], testExtraTiles[3]]);
  });
});
