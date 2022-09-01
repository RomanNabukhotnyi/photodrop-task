import * as AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const S3 = new AWS.S3();

const deletePhoto = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const name = decodeURIComponent(event.pathParameters.albumName);
    const { photoName } = event.pathParameters;
    const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${photoName}`;

    await PhotographerPhotos.update({
        username,
        name,
        photos: { $delete: [photoUrl] },
    });

    const { Items } = await ClientPhotos.scan({
        filters: [
            { attr: 'url', eq: photoUrl },
        ],
    });

    for (const item of Items) {
        if (item.watermark) {
            await ClientPhotos.delete({
                number: item.number,
                url: photoUrl,
            });
        }
    }

    const { Items: photos } = await ClientPhotos.scan({
        filters: [
            { attr: 'url', eq: photoUrl },
        ],
    });

    if (photos) {
        if (!photos.find(photo=>photo.url === photoUrl)) {
            await S3.deleteObject({
                Bucket: process.env.BUCKET_NAME,
                Key: photoName,
            }).promise();
        }
    }

    return {
        message: 'Successfully deleted',
    };
};

export const main = middyfy(deletePhoto);