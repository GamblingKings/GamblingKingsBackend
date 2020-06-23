![CI](https://github.com/GamblingKings/GamblingKingsBackend/workflows/CI/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/GamblingKings/GamblingKingsBackend/branch/master/graph/badge.svg)](https://codecov.io/gh/GamblingKings/GamblingKingsBackend)

# Mahjong Application

## Local development

**Prerequisite:**

- Node.Js
- Typescript
- Serverless
- Java Runtime Engine (JRE) version 6.x or newer

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

2. Remember to uncomment the code for local dev in [serverless.yml](./serverless.yml), [db.ts](src/module/dynamodb/db.ts) and [WebSocketClient.ts](./src/WebSocketClient.ts)

3. (**Important**) Increase max space size for Node (otherwise, webpack may not work in your local machine)

```
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

1. Deploy or remove AWS resources \
   **Note：** --no-session flag seems to be required。 See this [bug](https://github.com/serverless/serverless/issues/5199) for more details

**To deploy:**

```shell script
aws-vault exec <PROFILE_NAME> --no-session -- sls deploy
```

To remove:

```shell script
aws-vault exec <PROFILE_NAME> --no-session -- sls remove
```

**To start a production build and deploy to AWS**

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
      "gameName": "Chow Yun-fat，the Mhajong King",
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

## Testing

- [Jest framework](https://jestjs.io/) is used for testing
- [jest-dynalite](https://github.com/freshollie/jest-dynalite) is used to run test with a mock DynamoDB instance
- [jest-extended](https://github.com/jest-community/jest-extended) is used to add additional matchers to Jest's default ones

### Configuration files

- [jest.config.js](./jest.config.js)
- [jest-dynalite-config.json](./jest-dynalite-config.json)
- [global.d.ts](./src/global.d.ts): for ide or editor to recognize jest-extended library

### Test folder

See [**test**](./src/__test__)

## TODOs on Optimization and Future Refactoring

- [ ] Refactor and optimize addUserToGame call to DynamoDB
- [ ] Refactor and optimize removeUserFromGame call to DynamoDB
