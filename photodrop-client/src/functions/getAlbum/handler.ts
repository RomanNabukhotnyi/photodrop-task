import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getAlbumPhotos = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const albumName = event.pathParameters.albumName;
    const { Item } = await ClientPhotos.get({
        number,
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