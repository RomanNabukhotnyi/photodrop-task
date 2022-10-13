import * as AWS from 'aws-sdk';
import { Handler, S3CreateEvent } from 'aws-lambda';
import axios from 'axios';
import sharp from 'sharp';

import { Client } from '../../db/entity/client';

const S3 = new AWS.S3();

const updateDb: Handler<S3CreateEvent> = async (event) => {
    const key = event.Records[0].s3.object.key;
    const [, clientId] = key.split('/');

    const imageUrl = S3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    });

    const bufferImage = await (await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer',
    })).data;

    const imageBuffer = await sharp(bufferImage).resize(150).jpeg().toBuffer();

    const selfieKey = `resized/${key}`;

    await S3.putObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: selfieKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    }).promise();

    await Client.update({
        id: clientId,
        selfieKey,
    });
};

export const main = updateDb;