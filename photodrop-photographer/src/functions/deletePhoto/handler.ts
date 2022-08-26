import * as AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const S3 = new AWS.S3();

const deletePhoto = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const albumName = event.pathParameters.albumName;
    const photoName = event.pathParameters.photoName;
    const photoKey = `${username}/${albumName}/${photoName}.jpg`;
    const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${photoKey}`;
    
    await S3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
    }).promise();

    await PhotographerPhotos.update({
        username,
        albumName,
        photos: { $delete: [photoUrl] },
    });

    const { Items } = await ClientPhotos.scan({
        filters: [
            { attr: 'url', eq: photoUrl },
        ],
    });

    for (const item of Items) {
        await ClientPhotos.delete({
            number: item.number,
            url: photoUrl,
        });
    }

    return {
        message: 'Successfully deleted.',
    };
};

export const main = middyfy(deletePhoto);