import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['name', 'location', 'date'],
    });

    return [...new Map(Items.map(item=>[item.name, item])).values()] ?? [];
};

export const main = middyfy(getListAlbums);