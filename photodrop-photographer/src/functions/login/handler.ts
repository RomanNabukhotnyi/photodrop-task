import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Photographer } from '../../db/entity/photographer';

import schema from './schema';

const generateTokens = (id: string) => {
    const payload = {
        id,
    };
    const { ACCES_SECRET, REFRESH_SECRET } = process.env;
    const accessToken = jwt.sign(payload, ACCES_SECRET!, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET!, { expiresIn: '30d' });
    return {
        accessToken,
        refreshToken,
    };
};

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { password } = event.body;
    const username = event.body.username.trim();
    const { Items: [photographer] = [] } = await Photographer.scan({
        filters: [
            { attr: 'username', eq: username },
        ],
    });
    if (!photographer) {
        throw new createError.BadRequest('No photographer with this username was found');
    }
    const isValidPassword = await bcrypt.compare(password, photographer.passwordHash);
    if (!isValidPassword) {
        throw new createError.BadRequest('Incorrect password entered');
    }
    const tokens = generateTokens(photographer.id);
    await Photographer.update({
        id: photographer.id,
        refreshToken: tokens.refreshToken,
    });
    return {
        message: 'Success',
        token: tokens.accessToken,
    };
};

export const main = middyfy(login, schema);