import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';
import { PhotographerClients } from '../../db/entity/photographerClients';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const { albumName, numbers, amount } = event.body;
    const { Item: photographerPhotos } = await PhotographerPhotos.get({
        username,
        albumName,
    });
    if (!photographerPhotos) {
        throw new createError.BadRequest('No album with this name was found.');
    }

    const photoUrls: string[] = [];
    const urls: string[] = [];

    for (let i = 0; i < amount; i++) {
        const photoKey = `${username}/${albumName}/${uuid()}.jpg`;
        const url = S3.getSignedUrl('putObject', {
            Bucket: process.env.BUCKET_NAME,
            Key: photoKey,
            Expires: 3600,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
        });
        urls.push(url);
        const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${photoKey}`;
        photoUrls.push(photoUrl);
    }

    if (!photographerPhotos.photos) {
        await PhotographerPhotos.update({
            username,
            albumName,
            photos: photoUrls,
        });
    } else {
        await PhotographerPhotos.update({
            username,
            albumName,
            photos: { $add: photoUrls },
        });
    }

    for (const number of numbers) {
        await PhotographerClients.put({
            username,
            number,
        });

        const { Item: { albumLocation, albumDate } } = await PhotographerPhotos.get({
            username,
            albumName,
        }, {
            attributes: ['albumName', 'albumLocation', 'albumDate'],
        });
        
        for (const url of photoUrls) {
            await ClientPhotos.put({
                number,
                url,
                albumName,
                albumLocation,
                albumDate,
                watermark: true,
            });
        }
    }

    return urls;
};

export const main = middyfy(getPresignedUrl);