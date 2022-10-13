import TelegramBot from 'node-telegram-bot-api';
import createError from 'http-errors';


import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';
import { Otp } from '../../db/entity/otp';

import schema from './schema';

const bot = new TelegramBot(process.env.TOKEN!, { polling: true } );

const sendOtp: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { number, newNumber } = event.body;
    const concatNumber = number.countryCode.concat(number.phoneNumber);
    const concatNewNumber = newNumber?.countryCode.concat(newNumber.phoneNumber);
    const otp = (Math.floor(Math.random() * (999999 - 100000)) + 100000).toString();
    const expiryAt = Math.round(new Date().getTime() / 1000) + 3 * 60;

    if (concatNewNumber) {
        const { Items: [client] = [] } = await Client.query(concatNewNumber, {
            index: 'NumberIndex',
        });

        if (client) {
            throw new createError.BadRequest('A client with this number already exists.');
        }

        await Otp.put({
            number: concatNewNumber,
            otp, 
            expiryAt,
        });
    } else {
        await Otp.put({
            number: concatNumber,
            otp,
            expiryAt,
        });
    }

    await bot.sendMessage(process.env.CHAT_ID!, `Photodrop\n${concatNewNumber ? concatNewNumber : concatNumber}\nYour code: ${otp}`);

    return {
        message: 'Otp sent.',
    };
};

export const main = middyfy(sendOtp, schema);