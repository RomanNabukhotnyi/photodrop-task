import * as AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const S3 = new AWS.S3({
    signatureVersion: 'v4',
    credentials: new AWS.Credentials({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    }),
});

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['name', 'location', 'date', 'url', 'watermark'],
    });

    return [...new Map(Items.map(album=>[album.name, {
        name: album.name,
        location: album.location,
        date: album.date,
        photos: Items.map(item => {
            return item.name == album.name ? {
                url: item.watermark ? S3.getSignedUrl('getObject', {
                    Bucket: process.env.LAMBDA_ACCESS_POINT_ARN,
                    Key: item.url.replace(`https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/`, ''),
                    Expires: 86400,
                }) : item.url,
                watermark: item.watermark,
            } : null;
        }).filter(item => item != null),
    }])).values()] ?? [];
};

export const main = middyfy(getListAlbums);