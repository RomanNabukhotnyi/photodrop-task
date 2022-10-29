import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { Album } from '../../db/entity/album';

const getListAlbums: APIGatewayProxyHandlerV2WithJWTAuthorizer<any> = async (event) => {
    const photographerId: string = event.requestContext.authorizer.principalId;

    const { Items: albums = [] } = await Album.query(photographerId, {
        index: 'photographerIdIndex',
        attributes: ['id', 'name', 'location', 'date', 'created'],
    });
    // eslint-disable-next-line no-underscore-dangle
    const sortedAlbums = albums.sort((a: any, b: any) => new Date(b._ct).getTime() - new Date(a._ct).getTime());

    return sortedAlbums;
};

export const main = middyfy(getListAlbums);