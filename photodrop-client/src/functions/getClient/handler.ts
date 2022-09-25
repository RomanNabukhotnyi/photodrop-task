import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';


const getClient = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Item } = await Client.get({
        number,
    });
    if (!Item) {
        throw new createError.NotFound('Client not found.');
    }
    return {
        number: {
            countryCode: Item.countryCode,
            phoneNumber: number.replace(Item.countryCode, ''),
        },
        name: Item.name,
        email: Item.email,
        selfie: Item.selfie,
    };
};

export const main = middyfy(getClient);