module.exports = {
  tables: [
    {
      TableName: `ConnectionsTable`,
      KeySchema: [{ AttributeName: 'connectionId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'connectionId', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: `GamesTable`,
      KeySchema: [{ AttributeName: 'gameId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'gameId', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
  ],
  port: 8001,
};
