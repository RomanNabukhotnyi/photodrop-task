import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const AlbumsTable = new Table({
    name: process.env.ALBUMS_TABLE_NAME,
    partitionKey: 'photographerId',
    sortKey: 'id',
    entityField: false,
    DocumentClient,
    indexes: {
        IdIndex: {
            partitionKey: 'id',
        },
    },
});