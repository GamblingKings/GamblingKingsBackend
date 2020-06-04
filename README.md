# Mahjong Application

## Local development

Prerequisite:

- Node.Js
- Typescript
- Serverless
- Java Runtime Engine (JRE) version 6.x or newer

1. Install dependencies and start serverless offline for local dev:

```shell script
# Cleanup auto-generated folders
yarn run dev:cleanup

# Install dependencies
yarn run dev:install

# Uncomment the code for local dev in both serverless.yml and db.ts
# Change ENVIRONMENT to local in .env, and

# Install dynamodb local (this will create a folder called `.dynamodb` in the project root directory)
# Start serverless and dynamodb locally
yarn run dev:run

# Or run all three scripts at the same time
yarn run start_local
```

2. Test Connection [here](https://www.websocket.org/echo.html) by entering the websocket url (e.g. `ws://localhost:3001`)

For more details on local dev, see the following links

- [Serverless Local Development](https://www.serverless.com/blog/serverless-local-development/)
- [Serverless DynamoDB Local](https://www.serverless.com/plugins/serverless-dynamodb-local/)
- [Serverless Plugin Typescript](https://www.serverless.com/plugins/serverless-plugin-typescript/)

3. To invoke lambda function locally see [invoke-local](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/)

## Deploy to AWS account

1. Add profile and credentials to .aws/credentials and ./aws/config file OR use [aws-vault](https://github.com/99designs/aws-vault) (Recommended):

```shell script
aws-vault add gamblingkings-sls
```

2. Change ENVIRONMENT to prod in .env

3. Deploy or remove AWS resources
   Note： --no-session flag seems to be required。 See this [bug](https://github.com/serverless/serverless/issues/5199) for more details

To deploy:

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
