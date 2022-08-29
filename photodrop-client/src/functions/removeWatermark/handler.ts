import { middyfy } from '../../libs/lambda';
import { ClientPhotos } from '../../db/entity/clientPhotos';

const remoweWatermark = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { photoKey } = event.pathParameters;

    await ClientPhotos.update({
        number,
        url: `https://${process.env.PHOTOGRAPHER_BUCKET_NAME}.s3.amazonaws.com/${photoKey}`,
        watermark: false,
    });

    return {
        message: 'Success.',
    };
};

export const main = middyfy(remoweWatermark);