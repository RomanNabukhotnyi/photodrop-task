import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['albumName', 'albumLocation', 'albumDate'],
    });

    return [...new Map(Items.map(item=>[item.albumName, item])).values()] ?? [];
};

export const main = middyfy(getListAlbums);