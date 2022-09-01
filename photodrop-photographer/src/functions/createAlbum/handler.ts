import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';

import schema from './schema';

const createAlbum: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const { name, location, date } = event.body;
    const { Item } = await PhotographerPhotos.get({
        username,
        name,
    });
    if (Item) {
        throw new createError.BadRequest('An album with that name already exists');
    }
    await PhotographerPhotos.put({
        username,
        name,
        location,
        date,
    });
    return {
        message: 'Successfully created album',
    };
};

export const main = middyfy(createAlbum, schema);