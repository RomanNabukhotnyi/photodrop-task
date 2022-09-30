import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { Client } from '../../db/entity/client';
import { middyfy } from '../../libs/lambda';

const S3 = new AWS.S3();

const getPresignedUrl = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Item } = await Client.get({
        number,
    });
    const photoKey = `${Item.id}/${uuid()}.jpg`;
    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
        Expires: 600,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
        Metadata: {
            number,
        },
    });

    return {
        url,
    };
};

export const main = middyfy(getPresignedUrl);