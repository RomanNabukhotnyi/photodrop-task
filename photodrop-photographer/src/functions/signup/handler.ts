import bcrypt from 'bcryptjs';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Photographer } from '../../db/entity/photographer';

import schema from './schema';

const signup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { username, password, fullName, email } = event.body;
    const { Item } = await Photographer.get({
        username,
    });
    if (Item) {
        throw new createError.BadRequest('A photographer with this username already exists.');
    }
    const passwordHash = await bcrypt.hash(password, 8);
    await Photographer.put({
        username,
        passwordHash,
        fullName,
        email,
    });
    return {
        message: 'User registration successful.',
    };
};

export const main = middyfy(signup);