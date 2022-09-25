import * as AWS from 'aws-sdk';
import { Table } from 'dynamodb-toolbox';

const DocumentClient = new AWS.DynamoDB.DocumentClient();

export const OtpsTable = new Table({
    name: process.env.OTPS_TABLE_NAME,
    partitionKey: 'number',
    entityField: false,
    DocumentClient,
});
