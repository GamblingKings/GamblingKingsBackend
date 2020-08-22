/**
 * Object used to initialize Honor Tile in the wall class
 */

import { HonorTileTypes } from '../../Tile/types/HonorTileTypes';

type HonorTileInitObject = {
  east: {
    type: HonorTileTypes;
  };
  south: {
    type: HonorTileTypes;
  };
  west: {
    type: HonorTileTypes;
  };
  north: {
    type: HonorTileTypes;
  };
  red: {
    type: HonorTileTypes;
  };
  green: {
    type: HonorTileTypes;
  };
  white: {
    type: HonorTileTypes;
  };
};

export const honorTileInit: HonorTileInitObject = {
  east: {
    type: HonorTileTypes.EAST,
  },
  south: {
    type: HonorTileTypes.SOUTH,
  },
  west: {
    type: HonorTileTypes.WEST,
  },
  north: {
    type: HonorTileTypes.NORTH,
  },
  red: {
    type: HonorTileTypes.REDDRAGON,
  },
  green: {
    type: HonorTileTypes.GREENDRAGON,
  },
  white: {
    type: HonorTileTypes.WHITEDRAGON,
  },
};
