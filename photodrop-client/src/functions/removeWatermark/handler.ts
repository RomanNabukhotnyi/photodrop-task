import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { ClientPhoto } from '../../db/entity/clientPhoto';

const remoweWatermark: APIGatewayProxyHandlerV2<any> = async (event) => {
    const stripeEvent = JSON.parse(event.body!);
    
    if (stripeEvent.type === 'checkout.session.completed') {
        const { clientId, albumId } = stripeEvent.data.object.metadata;

        const { Items: photos = [] } = await ClientPhoto.query(clientId, {
            filters: [
                { attr: 'albumId', eq: albumId },
            ],
        });

        for (const photo of photos) {
            await ClientPhoto.update({
                clientId,
                photoId: photo.photoId,
                watermark: false,
            });
        }
    }

    return {
        statusCode: 200,
    };
};

export const main = remoweWatermark;