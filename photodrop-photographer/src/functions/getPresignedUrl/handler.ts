import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const name = decodeURIComponent(event.pathParameters.albumName);
    const { numbers, amount } = event.body;
    const { Item: photographerPhotos } = await PhotographerPhotos.get({
        username,
        name,
    });
    if (!photographerPhotos) {
        throw new createError.BadRequest('No album with this name was found');
    }

    const urls: string[] = [];

    for (let i = 0; i < amount; i++) {
        const photoKey = `${uuid()}.jpg`;
        const url = S3.getSignedUrl('putObject', {
            Bucket: process.env.BUCKET_NAME,
            Key: photoKey,
            Expires: 3600,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
            Metadata: {
                username,
                name,
                numbers: JSON.stringify(numbers),
            },
        });
        urls.push(url);
    }

    return urls;
};

export const main = middyfy(getPresignedUrl, schema);