import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const remoweWatermark = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { photo } = event.body;

    await ClientPhotos.update({
        number,
        url: photo,
        watermark: false,
    });

    return {
        message: 'Success.',
    };
};

export const main = middyfy(remoweWatermark);