import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const ClientPhotosTable = new Table({
    name: process.env.CLIENT_PHOTOS_TABLE_NAME,
    partitionKey: 'clientId',
    sortKey: 'photoId',
    entityField: false,
    DocumentClient,
    indexes: {
        AlbumIdIndex: {
            partitionKey: 'albumId',
        },
    },
});
