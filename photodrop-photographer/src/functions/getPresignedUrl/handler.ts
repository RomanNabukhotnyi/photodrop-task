import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const { albumName, numbers, fileName } = event.body;
    const { Item: photographerPhotos } = await PhotographerPhotos.get({
        username,
        albumName,
    });
    if (!photographerPhotos) {
        throw new createError.BadRequest('No album with this name was found.');
    }
    const photoKey = `${username}/${albumName}/${fileName ?? uuid()}.jpg`;
    const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${photoKey}`;
    if (!photographerPhotos.photos) {
        await PhotographerPhotos.update({
            username,
            albumName,
            photos: [photoUrl],
        });
    } else {
        if (photographerPhotos.photos.some(p=>p === photoUrl)) {
            throw new createError.BadRequest('Photo already exists.');
        }
        await PhotographerPhotos.update({
            username,
            albumName,
            photos: { $add: [photoUrl] },
        });
    }

    for (const number of numbers) {
        const { Item: clientPhotos } = await ClientPhotos.get({
            number,
            albumName,
        });
        if (!clientPhotos) {
            const { Item: { albumLocation, albumDate } } = await PhotographerPhotos.get({
                username,
                albumName,
            }, {
                attributes: ['albumName', 'albumLocation', 'albumDate'],
            });
            await ClientPhotos.put({
                number,
                albumName,
                albumLocation,
                albumDate,
                photos: [{
                    url: photoUrl,
                    watermark: true,
                }],
            });
        } else {
            if (clientPhotos.photos.some((p:{ url })=>p.url === photoUrl)) {
                throw new createError.BadRequest('Photo already exists.');
            }
            await ClientPhotos.update({
                number,
                albumName,
                photos: {
                    $append: [{
                        url: photoUrl,
                        watermark: true,
                    }],
                },
            });
        }
    }
    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
        Expires: 600,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });
    return {
        url,
    };
};

export const main = middyfy(getPresignedUrl);