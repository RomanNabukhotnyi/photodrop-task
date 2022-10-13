import * as AWS from 'aws-sdk';
import TelegramBot from 'node-telegram-bot-api';
import { Handler, S3CreateEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import convertHEIC from 'heic-convert';
import axios from 'axios';
import sharp from 'sharp';

import { ClientPhoto } from '../../db/entity/clientPhoto';
import { PhotographerClient } from '../../db/entity/photographerClient';
import { Photo } from '../../db/entity/photo';
import { Client } from '../../db/entity/client';

const S3 = new AWS.S3();

const bot = new TelegramBot(process.env.TOKEN!);

const getImageBuffer = async (photoKey: string) => {
    const imageUrl = S3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
    });

    const buffer: Buffer = await (await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer',
    })).data;

    return buffer;
};

const putThumbnailToBucket = async (
    target: 'original' | 'watermark', 
    size: '300x300' | '600x600' | '1200x1200', 
    thumbnailId: string, 
    thumbnailBuffer: Buffer,
) => {
    await S3.putObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: `resized/${target}/${size}/${thumbnailId}.jpg`,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
    }).promise();
};

const resizeImage = async (target: 'original' | 'watermark', imageBuffer: Buffer, width: number, height: number) => {
    const image = await sharp(imageBuffer).jpeg({
        quality: 50,
    }).toBuffer();
    const bufferWatermark = await getImageBuffer(process.env.WATERMARK_KEY!);
    const watermark = await sharp(bufferWatermark).png({
        quality: 50,
    }).toBuffer();

    const resizedWatermark = await sharp(watermark).resize(Math.round(width / 2)).toBuffer();

    const { width: watermarkWidth, height: watermarkHeight } = await sharp(resizedWatermark).metadata();

    const left = Math.round(width / 2 - watermarkWidth! / 2);
    const top = Math.round(height / 2 - watermarkHeight! / 2);

    const imageWithWatermark = target === 'watermark' ? await sharp(image).resize(width, height).composite([{
        input: resizedWatermark,
        left,
        top,
    }]).jpeg().toBuffer() : await sharp(image).resize(width, height).jpeg().toBuffer();

    return imageWithWatermark;
};

const createThumbnails = async (target: 'original' | 'watermark', photoId: string, imageBuffer: Buffer) => {
    const imageBuffer300 = await resizeImage(target, imageBuffer, 300, 300);
    await putThumbnailToBucket(target, '300x300', photoId, imageBuffer300);
    
    const imageBuffer600 = await resizeImage(target, imageBuffer, 600, 600);
    await putThumbnailToBucket(target, '600x600', photoId, imageBuffer600);
    
    const imageBuffer1200 = await resizeImage(target, imageBuffer, 1200, 1200);
    await putThumbnailToBucket(target, '1200x1200', photoId, imageBuffer1200);
};

const createAndUploadThumbnails = async (photoKey: string) => {
    const [, photoId] = photoKey.replace(/\..+$/, '').split('/');

    const bufferImage = await getImageBuffer(photoKey);
    const image = await sharp(bufferImage).jpeg().toBuffer();

    await createThumbnails('original', photoId, image);
    await createThumbnails('watermark', photoId, image);
};

const convertAndUpload = async (photoKey: string, contentType: string) => {
    const [, photoId] = photoKey.replace(/\..+$/, '').split('/');

    const buffer = await getImageBuffer(photoKey);

    let convertedBuffer: Buffer | ArrayBuffer;

    if (contentType === 'image/heic' || contentType === 'image/heif') {
        convertedBuffer = await convertHEIC({
            buffer,
            format: 'JPEG',
            quality: 1,
        });
    } else if (contentType === 'image/png') {
        convertedBuffer = await sharp(buffer).jpeg().toBuffer();
    } else if (contentType === 'image/webp') {
        convertedBuffer = await sharp(buffer).jpeg().toBuffer();
    }

    await S3.deleteObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: photoKey,
    }).promise();

    await S3.putObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: `original/${photoId}.jpg`,
        Body: convertedBuffer,
        ContentType: 'image/jpeg',
    }).promise();
};


const updateDb: Handler<S3CreateEvent> = async (event) => {
    const key = event.Records[0].s3.object.key;
    const [, photoId] = key.replace(/\..+$/, '').split('/');

    const { ContentType, Metadata: { photographerid: photographerId, albumid: albumId, numbers, inform } = {} } = await S3.headObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
    }).promise();

    if (ContentType === 'image/heic' || ContentType === 'image/heif' || ContentType === 'image/png' || ContentType === 'image/webp') {
        await convertAndUpload(key, ContentType);
    } else {
        await createAndUploadThumbnails(key);
    }

    if (photographerId && albumId && numbers) {
        await Photo.put({
            albumId,
            id: photoId,
        });
    
        for (const number of JSON.parse(numbers)) {
            const concatNumber = number.countryCode.concat(number.phoneNumber);
    
            const { Items: [client] = [] } = await Client.scan({
                filters: [
                    { attr: 'number', eq: concatNumber },
                ],
            });
            
            let clientId = client?.id;
    
            if (!client) {
                clientId = uuid();
                await Client.put({
                    id: clientId,
                    number: concatNumber,
                    countryCode: number.countryCode,
                });
            }
    
            const { Item: photographerClient } = await PhotographerClient.get({
                photographerId,
                clientId,
            });
    
            if (!photographerClient) {
                await PhotographerClient.put({
                    photographerId,
                    clientId,
                });
            }
    
            const { Items: clientPhotos } = await ClientPhoto.query(clientId, {
                filters: [
                    { attr: 'albumId', eq: albumId },
                ],
            });
    
            let watermark = true;
            if (clientPhotos?.length != 0 && clientPhotos?.every(photo=>photo.watermark === false)) {
                watermark = false;
            }
    
            await ClientPhoto.put({
                clientId,
                photoId,
                albumId,
                watermark,
            });
    
            if ( inform === 'true' ) {
                await bot.sendMessage(
                    process.env.CHAT_ID!, 
                    `Photodrop\n${concatNumber}\nYour photos have dropped.\n${process.env.PHOTODROP_CLIENT_URL}`,
                );
            }
        }
    }
};

export const main = updateDb;