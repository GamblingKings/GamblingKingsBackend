#!/bin/bash

SEPARATOR="--------------------------------------------------"
ENDPOINT="http://localhost:8000"
CONNECTIONS="Connections"
GAMES="Games"

echo $SEPARATOR
echo "Deleting $CONNECTIONS table at $ENDPOINT"
aws dynamodb delete-table \
    --table-name $CONNECTIONS \
    --endpoint-url $ENDPOINT
echo $SEPARATOR

echo $SEPARATOR
echo "Deleting $GAMES table at $ENDPOINT"
aws dynamodb delete-table \
    --table-name $GAMES \
    --endpoint-url $ENDPOINT
echo $SEPARATOR
