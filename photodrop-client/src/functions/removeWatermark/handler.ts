import createError from 'http-errors';

import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const remoweWatermark = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const photoKey = decodeURIComponent(event.pathParameters.photoKey);

    if (!(photoKey as string).includes('.jpg')) {
        const albumName = photoKey;
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
                url: item.url,
                watermark: false,
            });
        }
    } else {
        const url = `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/${photoKey}`;
        const { Item } = await ClientPhotos.get({
            number,
            url,
        });
        if (!Item) {
            throw new createError.BadRequest('No photo with this name was found.');
        }
        await ClientPhotos.update({
            number,
            url,
            watermark: false,
        });
    }

    return {
        message: 'Success.',
    };
};

export const main = middyfy(remoweWatermark);