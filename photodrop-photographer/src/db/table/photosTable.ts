import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const PhotosTable = new Table({
    name: process.env.PHOTOS_TABLE_NAME,
    partitionKey: 'id',
    sortKey: 'albumId',
    entityField: false,
    DocumentClient,
    indexes: {
        albumIdIndex: {
            partitionKey: 'albumId',
        },
    },
});
