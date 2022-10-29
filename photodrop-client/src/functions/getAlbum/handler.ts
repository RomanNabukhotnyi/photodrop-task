import createError from 'http-errors';
import * as AWS from 'aws-sdk';
import { APIGatewayEvent, Handler } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { ClientPhoto } from '../../db/entity/clientPhoto';
import { Album } from '../../db/entity/album';

const S3 = new AWS.S3();

const getAlbum: Handler<APIGatewayEvent> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;
    const albumId = event!.pathParameters!.albumId!;

    const { Items: photos = [] } = await ClientPhoto.query(clientId, {
        filters: [
            { attr: 'albumId', eq: albumId },
        ],
    });

    if (!photos.length) {
        throw new createError.BadRequest('Album not found.');
    }

    // eslint-disable-next-line no-underscore-dangle
    const sortedPhoto = photos.sort((a: any, b: any) => new Date(b._ct).getTime() - new Date(a._ct).getTime());

    const { Items: [album] = [] } = await Album.query(albumId, {
        attributes: ['id', 'name', 'location', 'date'],
    });

    return {
        ...album,
        photos: sortedPhoto.map(photo => {
            const url300 = S3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_NAME,
                Key: photo.watermark ? `resized/watermark/300x300/${photo.photoId}.jpg` : `resized/original/300x300/${photo.photoId}.jpg`,
                Expires: 86400,
            });
            const url600 = S3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_NAME,
                Key: photo.watermark ? `resized/watermark/600x600/${photo.photoId}.jpg` : `resized/original/600x600/${photo.photoId}.jpg`,
                Expires: 86400,
            });
            const url1200 = S3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_NAME,
                Key: photo.watermark ? `resized/watermark/1200x1200/${photo.photoId}.jpg` : `resized/original/1200x1200/${photo.photoId}.jpg`,
                Expires: 86400,
            });
            const originalUrl = photo.watermark ? undefined : S3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_NAME,
                Key: `original/${photo.photoId}.jpg`,
                Expires: 86400,
            });
            return {
                id: photo.photoId,
                url300,
                url600,
                url1200,
                originalUrl,
                watermark: photo.watermark,
                // eslint-disable-next-line no-underscore-dangle
                dateAdded: (photo as any)._ct,
            };
        }),
    };
};

export const main = middyfy(getAlbum);