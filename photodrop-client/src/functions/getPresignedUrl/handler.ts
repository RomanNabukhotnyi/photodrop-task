import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';

const S3 = new AWS.S3();

const getPresignedUrl = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const photoKey = `${number}/selfie/${uuid()}.jpg`;
    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
        Expires: 600,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });
    const selfieUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${encodeURIComponent(photoKey)}`;
    
    await Client.update({
        number,
        selfie: selfieUrl,
    });

    return {
        url,
    };
};

export const main = middyfy(getPresignedUrl);