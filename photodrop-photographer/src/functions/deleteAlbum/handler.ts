import * as AWS from 'aws-sdk';
import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const S3 = new AWS.S3();

const deleteAlbum = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const name = decodeURIComponent(event.pathParameters.albumName);
    const { Item } = await PhotographerPhotos.get({
        username,
        name,
    });
    if (!Item) {
        throw new createError.BadRequest('The album does not exist');
    }
    if (Item.photos) {
        const { Items } = await ClientPhotos.scan({
            filters: [
                { attr: 'name', eq: name },
                { attr: 'location', eq: Item.location },
                { attr: 'date', eq: Item.date },
            ],
        });
        for (const item of Items) {
            if (item.watermark) {
                await ClientPhotos.delete({
                    number: item.number,
                    url: item.url,
                });
            }
        }
        const { Items: photos } = await ClientPhotos.scan({
            filters: [
                { attr: 'name', eq: name },
                { attr: 'location', eq: Item.location },
                { attr: 'date', eq: Item.date },
            ],
        });
        if (photos) {
            for (const url of Item.photos) {
                if (!photos.find(photo=>photo.url === url)) {
                    await S3.deleteObject({
                        Bucket: process.env.BUCKET_NAME,
                        Key: url.match(/[a-z0-9-]+\.jpg$/)[0],
                    }).promise();
                }
            }
        }
    }
    await PhotographerPhotos.delete({
        username,
        name,
    });

    return {
        message: 'Successfully deleted',
    };
};

export const main = middyfy(deleteAlbum);