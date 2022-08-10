import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const PhotographersTable = new Table({
    name: process.env.PHOTOGRAPHERS_TABLE_NAME,
    partitionKey: 'username',
    DocumentClient,
});
