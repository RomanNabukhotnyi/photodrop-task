import createError from 'http-errors';
import * as AWS from 'aws-sdk';
import { APIGatewayEvent, Handler } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';

const S3 = new AWS.S3();

const getClient: Handler<APIGatewayEvent> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;

    const { Item: client } = await Client.get({
        id: clientId,
    }, {
        attributes: ['number', 'countryCode', 'email', 'fullName', 'selfieKey'],
    });

    if (!client) {
        throw new createError.NotFound('Client not found.');
    }

    const selfieUrl = client.selfieKey ? S3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: client.selfieKey,
        Expires: 86400,
    }) : undefined;

    const { fullName, email, number, countryCode } = client;

    return {
        number: {
            countryCode,
            phoneNumber: number.replace(countryCode, ''),
        },
        fullName,
        email,
        selfie: selfieUrl,
    };
};

export const main = middyfy(getClient);