import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { v4 as uuid } from 'uuid';


import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';
import { Otp } from '../../db/entity/otp';
import { ClientPhotos } from '../../db/entity/clientPhotos';
import { PhotographerClients } from '../../db/entity/photographerClients';

import schema from './schema';

const verifyOtp: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { number, newNumber, code } = event.body;
    const concatNumber = number.countryCode.concat(number.phoneNumber);
    const concatNewNumber = newNumber?.countryCode.concat(newNumber.phoneNumber);
    if (concatNewNumber) {
        const { Item } = await Otp.get({
            number: concatNewNumber,
        }, {
            attributes: ['otp', 'expiryAt'],
        });
        if (!Item || !Item.otp || Item.otp != code || Item.expiryAt < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }
        const { Item: client } = await Client.get({
            number: concatNumber,
        });

        if (!client) {
            throw new createError.NotFound('Client not found.');
        }

        await Client.put({
            number: concatNewNumber,
            countryCode: newNumber.countryCode,
            id: client.id,
            name: client.name,
            email: client.email,
            selfie: client.selfie,
        });

        await Client.delete({
            number: concatNumber,
        });

        const { Items: clients } = await PhotographerClients.scan({
            filters: [
                { attr: 'number', eq: concatNumber },
            ],
            attributes: ['username', 'number', 'countryCode', 'name'],
        });
    
        if (clients.length != 0) {
            for (const item of clients) {
                await PhotographerClients.put({
                    username: item.username,
                    number: concatNewNumber,
                    countryCode: newNumber.countryCode,
                    name: item.name,
                });
                await PhotographerClients.delete({
                    username: item.username,
                    number: concatNumber,
                });
            }
        }

        const { Items } = await ClientPhotos.query(concatNumber);
        for (const item of Items) {
            await ClientPhotos.put({
                number: concatNewNumber,
                key: item.key,
                name: item.name,
                location: item.location,
                date: item.date,
                watermark: item.watermark,
            });
            await ClientPhotos.delete({
                number: item.number,
                key: item.key,
            });
        }
    } else {
        const { Item } = await Otp.get({
            number: concatNumber,
        }, {
            attributes: ['otp', 'expiryAt'],
        });

        if (!Item) {
            throw new createError.NotFound('Client not found.');
        }

        if (!Item.otp || Item.otp != code || Item.expiryAt < Math.round(new Date().getTime() / 1000)) {
            throw new createError.BadRequest('Invalid code.');
        }
        const { Item: client } = await Client.get({
            number: concatNumber,
        });
        if (!client) {
            await Client.put({
                number: concatNumber,
                countryCode: number.countryCode,
                id: uuid(),
            });
        }
    }
    const payload = concatNewNumber ? { number: concatNewNumber } : { number: concatNumber };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' });
    return {
        token,
    };
};

export const main = middyfy(verifyOtp, schema);