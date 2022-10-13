import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import { v4 as uuid } from 'uuid';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Photographer } from '../../db/entity/photographer';

import schema from './schema';

const signup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { username, password, fullName, email } = event.body;
    const { Items: photographers } = await Photographer.scan({
        filters: [
            { attr: 'username', eq: username },
        ],
    });
    if (!photographers) {
        throw new createError.BadRequest('A photographer with this username already exists');
    }
    const passwordHash = await bcrypt.hash(password, 8);
    await Photographer.put({
        id: uuid(),
        username,
        passwordHash,
        fullName,
        email,
    });
    return {
        message: 'User registration successful',
    };
};

export const main = middyfy(signup, schema);