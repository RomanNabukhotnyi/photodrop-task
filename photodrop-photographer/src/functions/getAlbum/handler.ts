import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';

const getAlbumPhotos = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const albumName = event.pathParameters.albumName;
    const { Item } = await PhotographerPhotos.get({
        username,
        albumName,
    }, {
        attributes: ['albumName', 'albumLocation', 'albumDate', 'photos'],
    });
    if (!Item) {
        throw new createError.BadRequest('No album with this name was found.');
    }
    return Item;
};

export const main = middyfy(getAlbumPhotos);