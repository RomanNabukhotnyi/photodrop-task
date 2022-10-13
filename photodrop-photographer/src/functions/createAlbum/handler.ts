import createError from 'http-errors';
import { v4 as uuid } from 'uuid';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Album } from '../../db/entity/album';

import schema from './schema';

const createAlbum: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const photographerId: string = event!.requestContext!.authorizer!.principalId;
    const name = event.body.name.trim();
    const location = event.body.location.trim();
    const date = event.body.date.trim();

    const { Items: albums = [] } = await Album.scan({
        filters: [
            { attr: 'name', eq: name },
            { attr: 'photographerId', eq: photographerId },
            { attr: 'location', eq: location },
            { attr: 'date', eq: date },
        ],
    });

    if (albums.length) {
        throw new createError.BadRequest('The album already exists');
    }

    const albumId = uuid();

    await Album.put({
        id: albumId,
        photographerId,
        name,
        location,
        date,
    });

    return {
        id: albumId,
        name,
        location,
        date,
    };
};

export const main = middyfy(createAlbum, schema);