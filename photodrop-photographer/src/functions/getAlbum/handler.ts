import createError from 'http-errors';
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { Album } from '../../db/entity/album';
import { Photo } from '../../db/entity/photo';

const getAlbum: APIGatewayProxyHandlerV2WithJWTAuthorizer<any> = async (event) => {
    const photographerId: string = event.requestContext.authorizer.principalId;
    const albumId = event!.pathParameters!.albumId!;

    const { Item: album } = await Album.get({
        photographerId,
        id: albumId,
    }, {
        attributes: ['id', 'name', 'location', 'date'],
    });

    if (!album) {
        throw new createError.BadRequest('Album not found');
    }

    const { Count: countPhotos } = await Photo.query(albumId);

    return {
        ...album,
        countPhotos,
    };
};

export const main = middyfy(getAlbum);