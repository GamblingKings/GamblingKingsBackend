# Mahjong Application

## Local development

1. Install dependencies and start serverless offline for local dev

```bash
# Install dependencies
yarn install

# Install dynamodb local (this will create a folder called `.dynamodb` in the project root directory)
sls dynamodb install

# Start serverless and dynamodb locally
sls offline start
```

2. Test Connection [here](https://www.websocket.org/echo.html) by entering the websocket url (e.g. `ws://localhost:3001`)

For more details on local dev, see the following links

- [Serverless Local Development](https://www.serverless.com/blog/serverless-local-development/)
- [Serverless DynamoDB Local](https://www.serverless.com/plugins/serverless-dynamodb-local/)
- [Serverless Plugin Typescript](https://www.serverless.com/plugins/serverless-plugin-typescript/)

3. To invoke lambda function locally see [invoke-local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)
