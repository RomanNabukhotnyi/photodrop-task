import jwt from 'jsonwebtoken';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';
import { ClientPhotos } from '../../db/entity/clientPhotos';

import schema from './schema';

const verifyOtp: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { number, newNumber, code } = event.body;
    if (newNumber) {
        const { Item: { otp, expiryAt } } = await Client.get({
            number: newNumber,
        }, {
            attributes: ['otp', 'expiryAt'],
        });
        if (!otp || otp != code || expiryAt < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }
        const { Item } = await Client.get({
            number,
        });
        await Client.update({
            number: newNumber,
            name: Item.name,
            email: Item.email,
            selfie: Item.selfie,
        });
        await Client.delete({
            number,
        });

        const { Items } = await ClientPhotos.query(number);
        for (const item of Items) {
            await ClientPhotos.put({
                number: newNumber,
                url: item.url,
                name: item.name,
                location: item.location,
                date: item.date,
                watermark: item.watermark,
            });
            await ClientPhotos.delete({
                number: item.number,
                url: item.url,
            });
        }
    } else {
        const { Item: { otp, expiryAt } } = await Client.get({
            number,
        }, {
            attributes: ['otp', 'expiryAt'],
        });
        if (!otp || otp != code || expiryAt < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }
    }
    const payload = newNumber ? { number: newNumber } : { number };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' });
    return {
        token,
    };
};

export const main = middyfy(verifyOtp, schema);