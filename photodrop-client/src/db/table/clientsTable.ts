import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const ClientsTable = new Table({
    name: process.env.CLIENTS_TABLE_NAME,
    partitionKey: 'number',
    entityField: false,
    DocumentClient,
});
