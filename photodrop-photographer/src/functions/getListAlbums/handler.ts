import { middyfy } from '../../libs/lambda';
import { PhotographerPhotos } from '../../db/entity/photographerPhotos';

const getListAlbums = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const { Items } = await PhotographerPhotos.query(username, {
        attributes: ['albumName', 'albumLocation', 'albumDate', 'photos'],
    });
    return Items ?? [];
};

export const main = middyfy(getListAlbums);