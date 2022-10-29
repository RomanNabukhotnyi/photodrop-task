import * as AWS from 'aws-sdk';
import createError from 'http-errors';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { Album } from '../../db/entity/album';
import { Photo } from '../../db/entity/photo';
import { ClientPhoto } from '../../db/entity/clientPhoto';

const S3 = new AWS.S3();

const deleteAlbum: APIGatewayProxyHandlerV2<any> = async (event) => {
    const albumId = event!.pathParameters!.albumId!;
    
    const { Items: [album] = [] } = await Album.query(albumId);

    if (!album) {
        throw new createError.BadRequest('Album not found');
    }

    const { Items: photos = [] } = await Photo.query(albumId, {
        index: 'albumIdIndex',
    });
    
    for (const photo of photos) {
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: 'original/' + photo.id,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/original/300x300/${photo.id}.jpg`,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/original/600x600/${photo.id}.jpg`,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/original/1200x1200/${photo.id}.jpg`,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/watermark/300x300/${photo.id}.jpg`,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/watermark/600x600/${photo.id}.jpg`,
        }).promise();
        await S3.deleteObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: `resized/watermark/1200x1200/${photo.id}.jpg`,
        }).promise();
        await Photo.delete({
            albumId,
            id: photo.id,
        });
        const { Items: clientPhotos = [] } = await ClientPhoto.scan({
            filters: [
                { attr: 'photoId', eq: photo.id },
            ],
        });
        await Promise.all(clientPhotos.map((clientPhoto) => ClientPhoto.delete({
            clientId: clientPhoto.clientId,
            photoId: clientPhoto.photoId,
        })));
    }
    await Album.delete({
        id: albumId,
        photographerId: album.photographerId,
    });

    return {
        message: 'Successfully deleted',
    };
};

export const main = middyfy(deleteAlbum);