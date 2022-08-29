import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Photographer } from '../../db/entity/photographer';

import schema from './schema';

const generateTokens = (username: string) => {
    const payload = {
        username,
    };
    const { ACCES_SECRET, REFRESH_SECRET } = process.env;
    const accessToken = jwt.sign(payload, ACCES_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
    return {
        accessToken,
        refreshToken,
    };
};

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { username, password } = event.body;
    const { Item } = await Photographer.get({
        username,
    });
    if (!Item) {
        throw new createError.BadRequest('No photographer with this username was found.');
    }
    const isValidPassword = await bcrypt.compare(password, Item.passwordHash);
    if (!isValidPassword) {
        throw new createError.BadRequest('Incorrect password entered.');
    }
    const tokens = generateTokens(username);
    await Photographer.update({
        username: Item.username,
        refreshToken: tokens.refreshToken,
    });
    return {
        message: 'Success.',
        token: tokens.accessToken,
    };
};

export const main = middyfy(login, schema);