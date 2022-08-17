import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const PhotographerPhotosTable = new Table({
    name: process.env.PHOTOGRAPHER_PHOTOS_TABLE_NAME,
    partitionKey: 'username',
    sortKey: 'albumName',
    entityField: false,
    DocumentClient,
});
