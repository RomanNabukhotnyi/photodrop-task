import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['albumName', 'albumLocation', 'albumDate'],
    });
    return Items ?? [];
};

export const main = middyfy(getListAlbums);