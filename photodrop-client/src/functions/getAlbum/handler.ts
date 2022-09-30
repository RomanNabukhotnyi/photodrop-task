import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

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
            const url = item.watermark 
                ? `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/watermark/${item.key}` 
                : `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/original/${item.key}`;
            return {
                url,
                watermark: item.watermark,
            };
        }),
    };
};

export const main = middyfy(getAlbum);