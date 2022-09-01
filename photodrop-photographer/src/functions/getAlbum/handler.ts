import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';

const getAlbum = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const name = decodeURIComponent(event.pathParameters.albumName);
    const { Item } = await PhotographerPhotos.get({
        username,
        name,
    }, {
        attributes: ['name', 'location', 'date', 'photos'],
    });
    if (!Item) {
        throw new createError.BadRequest('No album with this name was found');
    }
    return Item;
};

export const main = middyfy(getAlbum);