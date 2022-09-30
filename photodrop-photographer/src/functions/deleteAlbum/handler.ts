import * as AWS from 'aws-sdk';
import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const S3 = new AWS.S3();

const deleteAlbum = async (event) => {
    const name = decodeURIComponent(event.pathParameters.albumName);
    
    const { Items: albums } = await PhotographerPhotos.scan({
        filters: [
            { attr: 'name', eq: name },
        ],
    });

    if (!albums.length) {
        throw new createError.BadRequest('No album with this name was found');
    }

    const { Items: photos } = await ClientPhotos.scan({
        filters: [
            { attr: 'name', eq: name },
        ],
    });
    
    for (const photo of photos) {
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: 'original/' + photo.key,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: 'watermark/' + photo.key,
        }).promise();
        await ClientPhotos.delete({
            number: photo.number,
            key: photo.key,
        });
    }

    for (const album of albums) {
        await PhotographerPhotos.delete({
            username: album.username,
            name: album.name,
        });
    }

    return {
        message: 'Successfully deleted',
    };
};

export const main = middyfy(deleteAlbum);