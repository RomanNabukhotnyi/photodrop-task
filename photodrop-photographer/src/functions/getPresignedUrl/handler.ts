import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import createError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Album } from '../../db/entity/album';

import schema from './schema';

const S3 = new AWS.S3();

const getPresignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const photographerId: string = event!.requestContext!.authorizer!.principalId;
    const albumId = event!.pathParameters!.albumId!;
    const { numbers, contentType, isLast } = event.body;
    
    const { Item: album } = await Album.get({
        photographerId,
        id: albumId,
    });

    if (!album) {
        throw new createError.BadRequest('Album not found');
    }

    let ext: string;
    
    switch (contentType) {
        case 'image/jpeg': 
            ext = '.jpg';
            break;
        case 'image/png': 
            ext = '.png';
            break;
        case 'image/heic': 
            ext = '.heic';
            break;
        case 'image/heif': 
            ext = '.heif';
            break;
        case 'image/webp': 
            ext = '.webp';
            break;
        case 'image/jfif': 
            ext = '.jfif';
            break;
        default: throw new createError.BadRequest('Invalid content type');
    }

    const photoKey = `original/${uuid()}${ext}`;    

    const url = S3.getSignedUrl('putObject', {
        Bucket: process.env.BUCKET_NAME,
        Key: photoKey,
        Expires: 3600,
        ContentType: contentType,
        Metadata: {
            photographerId,
            albumId,
            numbers: JSON.stringify(numbers),
            inform: isLast ? 'true' : 'false',
        },
    });

    return url;
};

export const main = middyfy(getPresignedUrl, schema);
