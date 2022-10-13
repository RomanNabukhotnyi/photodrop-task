import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const PhotosTable = new Table({
    name: process.env.PHOTOS_TABLE_NAME,
    partitionKey: 'albumId',
    sortKey: 'id',
    entityField: false,
    DocumentClient,
    indexes: {
        IdIndex: {
            partitionKey: 'id',
        },
    },
});
