import * as AWS from 'aws-sdk';
import TelegramBot from 'node-telegram-bot-api';
import { Handler, S3CreateEvent } from 'aws-lambda';

import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';
import { PhotographerClients } from '../../db/entity/photographerClients';

const S3 = new AWS.S3();

const updateDb: Handler<S3CreateEvent> = async (event) => {
    const key = event.Records[0].s3.object.key;
    const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;

    const { Metadata } = await S3.headObject({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    }).promise();

    const { Item } = await PhotographerPhotos.get({
        username: Metadata.username,
        name: Metadata.name,
    });

    if (!Item.photos) {
        await PhotographerPhotos.update({
            username: Metadata.username,
            name: Metadata.name,
            photos: [photoUrl],
        });
    } else {
        await PhotographerPhotos.update({
            username: Metadata.username,
            name: Metadata.name,
            photos: { $add: [photoUrl] },
        });
    }

    const bot = await new TelegramBot(process.env.TOKEN, { polling: true } );

    for (const number of JSON.parse(Metadata.numbers)) {
        const { Item: client } = await PhotographerClients.get({
            username: Metadata.username,
            number: number.countryCode.concat(number.phoneNumber),
        });

        if (!client) {
            await PhotographerClients.put({
                username: Metadata.username,
                number: number.countryCode.concat(number.phoneNumber),
                countryCode: number.countryCode,
            });
        }

        const { Item: { location, date } } = await PhotographerPhotos.get({
            username: Metadata.username,
            name: Metadata.name,
        }, {
            attributes: ['name', 'location', 'date'],
        });
        
        await ClientPhotos.put({
            number: number.countryCode.concat(number.phoneNumber),
            url: photoUrl,
            name: Metadata.name,
            location,
            date,
            watermark: true,
        });

        await bot.sendMessage(process.env.CHAT_ID, `Photodrop\n${number}\nYour photos have dropped.`);
    }
};

export const main = updateDb;