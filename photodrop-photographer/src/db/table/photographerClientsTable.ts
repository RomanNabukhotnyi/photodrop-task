import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const PhotographerClientsTable = new Table({
    name: process.env.PHOTOGRAPHER_CLIENTS_TABLE_NAME,
    partitionKey: 'photographerId',
    sortKey: 'clientId',
    entityField: false,
    DocumentClient,
});
