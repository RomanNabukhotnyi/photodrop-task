import * as AWS from 'aws-sdk';
// import axios from 'axios';
import { APIGatewayEvent, Handler } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { ClientPhoto } from '../../db/entity/clientPhoto';
import { Album } from '../../db/entity/album';

const S3 = new AWS.S3();

// const getShortUrl = async (link: string) => {
//     const response = await axios('https://is.gd/create.php', {
//         method: 'GET',
//         params: {
//             format: 'json',
//             url: link,
//         },
//     });
//     return response.data.shorturl;
// };

const getListAlbums: Handler<APIGatewayEvent> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;

    const { Items: photos = [] } = await ClientPhoto.query(clientId);

    if (photos.length === 0) {
        return {
            albums: [],
            allPhotos: [],
        };
    }

    // eslint-disable-next-line no-underscore-dangle
    const sortedPhotos = photos.sort((a: any, b: any) => new Date(b._ct).getTime() - new Date(a._ct).getTime());

    const albumIds = sortedPhotos.reduce<{
        id: string,
        url300: string,
    }[]>((acc, photo) => {
        if (!acc.find(albumId => albumId.id === photo.albumId)) {
            const url300 = S3.getSignedUrl('getObject', {
                Bucket: process.env.BUCKET_NAME,
                Key: `resized/original/300x300/${photo.photoId}.jpg`,
                Expires: 86400,
            });
            acc.push({
                id: photo.albumId,
                url300,
            });
        }
        return acc;
    }, []);

    const albums = await Promise.all(albumIds.map<Promise<{
        id: string,
        name: string,
        location: string,
        date: string,
        url300: string,
    }>>(async albumId => {
        const { Items: [album] = [] } = await Album.query(albumId.id, {
            index: 'IdIndex',
            attributes: ['id', 'name', 'location', 'date', 'created'],
        });
        return {
            ...album,
            url300: albumId.url300,
        };
    }));

    // eslint-disable-next-line no-underscore-dangle
    const sortedAlbums = albums.sort((a: any, b: any) => new Date(b._ct).getTime() - new Date(a._ct).getTime());

    const allPhotos = sortedPhotos.map(photo => {
        const album = sortedAlbums.find(alb => alb.id === photo.albumId);
        const albumPhotos = sortedPhotos.filter(p => p.albumId === photo.albumId);
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
            albumId: album?.id,
            albumName: album?.name,
            url300,
            url600,
            url1200,
            originalUrl,
            countAlbumPhotos: albumPhotos.length,
            watermark: photo.watermark,
            // eslint-disable-next-line no-underscore-dangle
            dateAdded: (photo as any)._ct,
        };
    });

    return {
        albums: sortedAlbums,
        allPhotos,
    };
};

export const main = middyfy(getListAlbums);