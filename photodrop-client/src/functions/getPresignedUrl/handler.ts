import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { fileName } = event.queryStringParameters;
    const photoKey = `${number}/selfie/${fileName ?? uuid()}.jpg`;
    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
        Expires: 600,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });
    const selfieUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${encodeURIComponent(number)}/selfie/${fileName ?? uuid()}.jpg`;
    
    await Client.update({
        number,
        selfie: selfieUrl,
    });

    return {
        url,
    };
};

export const main = middyfy(getPresignedUrl);