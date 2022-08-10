import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const remoweWatermark = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { albumName, photo } = event.body;

    const { Item: { photos } } = await ClientPhotos.get({
        number, 
        albumName,
    });

    const index = photos.findIndex(p => p.url === photo);

    await ClientPhotos.update({
        number,
        albumName,
        photos: {
            [index]: {
                url: photo,
                watermark: false,
            },
        },
    });

    return {
        message: 'Success.',
    };
};

export const main = middyfy(remoweWatermark);