import createError from 'http-errors';
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

const getAlbum = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const name = decodeURIComponent(event.pathParameters.albumName);
    const { Items } = await ClientPhotos.scan({
        filters: [
            { attr: 'number', eq: number },
            { attr: 'name', eq: name },
        ],
    });
    if (Items.length == 0) {
        throw new createError.BadRequest('No album with this name was found.');
    }
    return {
        name,
        location: Items[0].location,
        date: Items[0].date,
        photos: Items.map(item => {
            const key = item.url.replace(`https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/`, '');
            const url = item.watermark ? S3.getSignedUrl('getObject', {
                Bucket: process.env.LAMBDA_ACCESS_POINT_ARN,
                Key: key,
                Expires: 86400,
            }) : item.url;
            return {
                url,
                watermark: item.watermark,
            };
        }),
    };
};

export const main = middyfy(getAlbum);