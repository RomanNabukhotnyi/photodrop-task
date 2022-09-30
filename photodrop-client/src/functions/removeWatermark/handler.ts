import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const remoweWatermark = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const albumName = decodeURIComponent(event.pathParameters.photoKey);

    const { Items } = await ClientPhotos.scan({
        filters: [
            { attr: 'number', eq: number },
            { attr: 'name', eq: albumName },
        ],
    });
    if (Items.length == 0) {
        throw new createError.BadRequest('No album with this name was found.');
    }
    for (const item of Items) {
        await ClientPhotos.update({
            number,
            key: item.key,
            watermark: false,
        });
    }

    return {
        message: 'Success.',
    };
};

export const main = middyfy(remoweWatermark);