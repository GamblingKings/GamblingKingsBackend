# Mahjong Application Backend

[![Last Commit](https://img.shields.io/github/last-commit/GamblingKings/GamblingKingsBackend?style=flat)](https://github.com/GamblingKings/GamblingKingsBackend/commits)
[![CI](https://github.com/GamblingKings/GamblingKingsBackend/workflows/CI/badge.svg)](https://github.com/GamblingKings/GamblingKingsBackend/actions?query=workflow%3ACI)
[![CD](https://github.com/GamblingKings/GamblingKingsBackend/workflows/CD/badge.svg)](https://github.com/GamblingKings/GamblingKingsBackend/actions?query=workflow%3ACD)
[![codecov](https://codecov.io/gh/GamblingKings/GamblingKingsBackend/branch/master/graph/badge.svg)](https://codecov.io/gh/GamblingKings/GamblingKingsBackend)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)](https://github.com/GamblingKings/GamblingKingsBackend/blob/master/LICENSE)

## Local development

### Prerequisite

- Node.Js
- Typescript
- Serverless
- Java Runtime Engine (JRE) version 6.x or newer
- (**Important**) Add a `config` file under `.aws` folder (`C:\Users\USERNAME\.aws\config` for Windows and `~/.aws/config` for Unix-based systems)

### Start local development

**To start local dev, simply run:**

```shell_script
yarn run start_local
```

OR

**Follow the steps below for detailed step breakdown:**

1. Install dependencies

```shell script
# Cleanup auto-generated folders
yarn run dev:cleanup

# Install dependencies
yarn run install_dep
```

2. Remember to uncomment the code for local dev in [serverless.yml](./serverless.yml)

3. (**Important**) Increase max space size for Node (otherwise, webpack may not work in your local machine)

```shell script
export NODE_OPTIONS="--max-old-space-size=8192"
```

4. Install dynamodb local (this will create a folder called `.dynamodb` in the project root directory) and start serverless and dynamodb locally

```shell script
yarn run dev:run
```

5. Test Connection [here](https://www.websocket.org/echo.html) by entering the websocket url (e.g. `ws://localhost:3001`)

For more details on local dev, see the following links

- [Serverless Local Development](https://www.serverless.com/blog/serverless-local-development/)
- [Serverless DynamoDB Local](https://www.serverless.com/plugins/serverless-dynamodb-local/)
- [Serverless Plugin Typescript](https://www.serverless.com/plugins/serverless-plugin-typescript/)

6. To invoke lambda function locally see [invoke-local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## Deploy to AWS account

1. Add profile and credentials to .aws/credentials and ./aws/config file OR use [aws-vault](https://github.com/99designs/aws-vault) (Recommended):

```shell script
aws-vault add gamblingkings-sls
```

2. Deploy or remove AWS resources \
   **Note:** `--no-session` flag seems to be required。 See this [bug](https://github.com/serverless/serverless/issues/5199) for more details

**To deploy:**

```shell script
aws-vault exec <PROFILE_NAME> --no-session -- sls deploy
```

**To remove:**

```shell script
aws-vault exec <PROFILE_NAME> --no-session -- sls remove
```

**To start a production build and deploy to AWS:**

```shell script
yarn start
```

## Websocket Test Data

`SET_USERNAME`

```json
{
  "action": "SET_USERNAME",
  "payload": {
    "username": "new user"
  }
}
```

`GET_ALL_USERS`

```json
{
  "action": "GET_ALL_USERS"
}
```

`CREATE_GAME`

```json
{
  "action": "CREATE_GAME",
  "payload": {
    "game": {
      "gameName": "Chow Yun-fat，the Mahjong King",
      "gameType": "Mahjong",
      "gameVersion": "Japanese"
    }
  }
}
```

`GET_ALL_GAMES`

```json
{
  "action": "GET_ALL_GAMES"
}
```

`SEND_MESSAGE`

```json
{
  "action": "SEND_MESSAGE",
  "payload": {
    "username": "test user",
    "message": "custom message to all users"
  }
}
```

`JOIN_GAME`

```json
{
  "action": "JOIN_GAME",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c"
  }
}
```

`LEAVE_GAME`

```json
{
  "action": "LEAVE_GAME",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c"
  }
}
```

`START_GAME`

```json
{
  "action": "START_GAME",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c"
  }
}
```

`GAME_PAGE_LOAD`

```json
{
  "action": "GAME_PAGE_LOAD",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c"
  }
}
```

`DRAW_TILE`

```json
{
  "action": "DRAW_TILE",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c"
  }
}
```

`PLAY_TILE`

```json
{
  "action": "PLAY_TILE",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c",
    "tile": "1_DOT"
  }
}
```

`PLAYED_TILE_INTERACTION`

```json
{
  "action": "PLAYED_TILE_INTERACTION",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c",
    "playedTiles": ["1_DOT", "1_DOT", "1_DOT"],
    "meldType": "TRIPLET",
    "skipInteraction": false
  }
}
```

`WIN_ROUND`

```json
{
  "action": "WIN_ROUND",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c",
    "handPointResults": {
      "totalPoints": 3,
      "handPoints": 3,
      "extraPoints": 0,
      "windPoints": 0,
      "dragonPoints": 0,
      "flowerPoints": 0,
      "hands": [
        {
          "points": 3,
          "name": "ALL_TRIPLET"
        }
      ],
      "tiles": [
        {
          "type": "DOT",
          "value": 1
        },
        {
          "type": "DOT",
          "value": 1
        },
        {
          "type": "DOT",
          "value": 2
        },
        {
          "type": "DOT",
          "value": 2
        },
        {
          "type": "DOT",
          "value": 2
        },
        {
          "type": "DOT",
          "value": 3
        },
        {
          "type": "DOT",
          "value": 3
        },
        {
          "type": "DOT",
          "value": 3
        },
        {
          "type": "DOT",
          "value": 4
        },
        {
          "type": "DOT",
          "value": 4
        },
        {
          "type": "DOT",
          "value": 4
        },
        {
          "type": "CHARACTER",
          "value": 7
        },
        {
          "type": "CHARACTER",
          "value": 7
        },
        {
          "type": "CHARACTER",
          "value": 7
        }
      ],
      "wind": "EAST",
      "bonusTiles": [],
      "flower": 1,
      "concealedPoint": 0
    }
  }
}
```

`SELF_PLAY_TILE`

```json
{
  "action": "SELF_PLAY_TILE",
  "payload": {
    "gameId": "5938902b-2e2c-4da8-b900-5cdfbba8f10c",
    "playedTile": "1_Dot",
    "isQuad": false,
    "alreadyMeld": false
  }
}
```

## General user flow

1. `connect` **x 4**: Four users connect to websocket
2. `CREATE_GAME`: One user creates a game
3. `JOIN_GAME` **x 3**: Three other users join the game created by the host
4. `START_GAME`: Starts the game if there are four users in the game
5. `GAME_PAGE_LOAD` **x 4**: Wait until assets are loaded on the frontend for all four users
6. `GAME_START`: Officially starts the game if gameLoadedCount for the game in the Games table is 4
7. `DRAW_TILE`: Draw one tile and send it to a user in the game
8. `LEAVE_GAME`: To remove user from the Games table if user disconnects or manually leave a game.
   Note: if the user leaving the game is the game host, the game will be deleted
9. `PLAY_TILE`: Send a played tile to all users in the game
10. `PLAYED_TILE_INTERACTION` \* 3: Interact with a played tile to make a meld (Consecutive, Triplet, or Quad), and the backend will decide who can take this tile based on meld priority. If all three other users decide not to take the tile, the tile can be skipped and not taken by anyone
11. `SELF_PLAY_TILE`: To play bonus tiles automatically at game start or during the game
12. `WIN_ROUND`: To win a game, update wind/dealer, and start a new game and distribute tiles to each user

## Testing

- [Jest framework](https://jestjs.io/) is used for testing
- [jest-dynalite](https://github.com/freshollie/jest-dynalite) is used to run test with a mock DynamoDB instance
- [jest-extended](https://github.com/jest-community/jest-extended) is used to add additional matchers to Jest's default ones

### Configuration files

- [jest.config.js](./jest.config.js)
- [jest-dynalite-config.js](./jest-dynalite-config.js)
- [global.d.ts](./global.d.ts): for ide or editor to recognize jest-extended library

### Test folder

- See [**test**](./__test__)

## TODOs on Optimization and Future Refactoring

- [ ] Refactor and optimize addUserToGame call to DynamoDB
- [ ] Refactor and optimize removeUserFromGame call to DynamoDB

## Build Optimization

See this article to know more about how to [optimize build time using typescript, serverless, webpack, and eslint](https://itnext.io/how-to-optimise-your-serverless-typescript-webpack-eslint-setup-for-performance-86d052284505)
