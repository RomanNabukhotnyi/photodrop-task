import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;
    const { contentType } = event.body;

    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: `selfie/${clientId}/${uuid()}`,
        Expires: 3600,
        ContentType: contentType,
    });

    return url;
};

export const main = middyfy(getPresignedUrl);