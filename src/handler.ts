import db from "./module/db";

interface putParamsObj {
  TableName: string;
  Item: {
    connectionId: string;
  };
}

interface deleteParamsObj {
  TableName: string;
  Key: {
    connectionId: string;
  };
}

async function connectionManager(event: any): Promise<object> {
  if (event.requestContext.eventType === "CONNECT") {
    const putParams: putParamsObj = {
      TableName: process.env.ConnectionDynamoDBTable,
      Item: {
        connectionId: event.requestContext.connectionId,
      },
    };

    return await db.put(putParams).promise();
  } else if (event.requestContext.eventType === "DISCONNECT") {
    const deleteParams: deleteParamsObj = {
      TableName: process.env.ConnectionDynamoDBTable,
      Key: {
        connectionId: event.requestContext.connectionId,
      },
    };

    return await db.delete(deleteParams).promise();
  }
}

async function defaultMessage(event: any) {
  return {
    status: 403,
    event: event,
  };
}

module.exports = {
  connectionManager,
  defaultMessage,
};
