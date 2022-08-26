import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getAlbumPhotos = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const albumName = event.pathParameters.albumName;
    const { Items } = await ClientPhotos.scan({
        filters: [
            { attr: 'number', eq: number },
            { attr: 'albumName', eq: albumName },
        ],
    });
    if (!Items) {
        throw new createError.BadRequest('No album with this name was found.');
    }
    return {
        albumName,
        albumLocation: Items[0].albumLocation,
        albumDate: Items[0].albumDate,
        photos: Items.map(item => ({
            url: item.url,
            watermark: item.watermark,
        })),
    };
};

export const main = middyfy(getAlbumPhotos);