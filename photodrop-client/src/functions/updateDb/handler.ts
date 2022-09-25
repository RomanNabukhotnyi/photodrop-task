import * as AWS from 'aws-sdk';
import { Handler, S3CreateEvent } from 'aws-lambda';

import { Client } from '../../db/entity/client';

const S3 = new AWS.S3();

const updateDb: Handler<S3CreateEvent> = async (event) => {
    const key = event.Records[0].s3.object.key;
    const selfieUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
    const { Metadata } = await S3.headObject({
        Bucket: process.env.BUCKET_NAME,
        Key: decodeURIComponent(key),
    }).promise();

    await Client.update({
        number: Metadata.number,
        selfie: selfieUrl,
    });
};

export const main = updateDb;