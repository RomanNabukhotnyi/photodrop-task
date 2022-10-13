import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { v4 as uuid } from 'uuid';


import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';
import { Otp } from '../../db/entity/otp';

import schema from './schema';

const verifyOtp: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { number, newNumber, code } = event.body;
    const concatNumber = number.countryCode.concat(number.phoneNumber);
    const concatNewNumber = newNumber?.countryCode.concat(newNumber.phoneNumber);


    const { Items: [client] = [] } = await Client.query(concatNumber, {
        index: 'NumberIndex',
    });

    let clientId = client?.id;

    if (concatNewNumber) {
        const { Item } = await Otp.get({
            number: concatNewNumber,
        }, {
            attributes: ['otp', 'expiryAt'],
        });
        if (!Item || !Item.otp || Item.otp != code || Item.expiryAt! < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }

        if (!client) {
            throw new createError.NotFound('Client not found.');
        }

        await Client.update({
            id: client.id,
            number: concatNewNumber,
            countryCode: newNumber!.countryCode,
        });
    } else {
        const { Item } = await Otp.get({
            number: concatNumber,
        }, {
            attributes: ['otp', 'expiryAt'],
        });

        if (!Item) {
            throw new createError.NotFound('Client not found.');
        }

        if (!Item.otp || Item.otp != code || Item.expiryAt! < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }

        if (!client) {
            clientId = uuid();

            await Client.put({
                id: clientId,
                number: concatNumber,
                countryCode: number.countryCode,
            });
        }
    }

    const payload = { id: clientId };
    const token = jwt.sign(payload, process.env.SECRET!, { expiresIn: '1d' });

    return {
        token,
    };
};

export const main = middyfy(verifyOtp, schema);