import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const getListAlbums = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Items } = await ClientPhotos.query(number, {
        attributes: ['name', 'location', 'date', 'url', 'watermark'],
    });

    return [...new Map(Items.map(album=>[album.name, {
        name: album.name,
        location: album.location,
        date: album.date,
        photos: Items.map(item => (item.name == album.name ? {
            url: item.url,
            watermark: item.watermark,
        } : null)).filter(item => item != null),
    }])).values()] ?? [];
};

export const main = middyfy(getListAlbums);