import * as AWS from 'aws-sdk';
import TelegramBot from 'node-telegram-bot-api';
import { Handler, S3CreateEvent } from 'aws-lambda';
import jimp from 'jimp';

import { PhotographerPhotos } from '../../db/entity/photographerPhotos';
import { ClientPhotos } from '../../db/entity/clientPhotos';
import { PhotographerClients } from '../../db/entity/photographerClients';

const S3 = new AWS.S3();

const updateDb: Handler<S3CreateEvent> = async (event) => {
    const key = event.Records[0].s3.object.key;
    const photoUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;

    const image = await jimp.read(photoUrl);
    const watermarkImage = await jimp.read(process.env.WATERMARK_URL);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const resizedWatermark = watermarkImage.resize(width / 2, jimp.AUTO);
    const watermarkWidth = resizedWatermark.bitmap.width;
    const watermarkHeight = resizedWatermark.bitmap.height;
    const x = width / 2 - watermarkWidth / 2;
    const y = height / 2 - watermarkHeight / 2;
    image.composite(resizedWatermark, x, y, {
        mode: jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5,
        opacityDest: 1,
    });

    const buffer = await image.getBufferAsync(jimp.MIME_JPEG);

    await S3.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: `watermark/${key.split('/')[1]}`,
        ACL: 'public-read',
        Body: buffer,
        ContentType: 'image/jpeg',
    }).promise();

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
        const concatNumber = number.countryCode.concat(number.phoneNumber);
        const { Item: client } = await PhotographerClients.get({
            username: Metadata.username,
            number: concatNumber,
        });

        if (!client) {
            await PhotographerClients.put({
                username: Metadata.username,
                number: concatNumber,
                countryCode: number.countryCode,
            });
        }

        const { Item: { location, date } } = await PhotographerPhotos.get({
            username: Metadata.username,
            name: Metadata.name,
        }, {
            attributes: ['name', 'location', 'date'],
        });
        
        const { Items: clientPhotos } = await ClientPhotos.scan({
            filters: [
                { attr: 'number', eq: concatNumber },
                { attr: 'name', eq: Metadata.name },
                { attr: 'location', eq: location },
                { attr: 'date', eq: date },
            ],
        });
        let watermark = true;
        if (clientPhotos.length != 0 && clientPhotos.every(photo=>photo.watermark === false)) {
            watermark = false;
        }

        await ClientPhotos.put({
            number: concatNumber,
            key: key.split('/')[1],
            name: Metadata.name,
            location,
            date,
            watermark,
        });

        if ( Metadata.inform == 'true' ) {
            await bot.sendMessage(process.env.CHAT_ID, `Photodrop\n${concatNumber}\nYour photos have dropped.`);
        }
    }
};

export const main = updateDb;