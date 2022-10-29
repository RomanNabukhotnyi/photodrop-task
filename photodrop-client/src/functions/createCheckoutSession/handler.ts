import createError from 'http-errors';
import stripe from 'stripe';

import { middyfy } from '../../libs/lambda';
import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { ClientPhoto } from '../../db/entity/clientPhoto';
import { Album } from '../../db/entity/album';

import schema from './schema';

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-08-01',
});

const createCheckoutSession: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;
    const albumId = event!.pathParameters!.albumId!;
    const { successUrl, cancelUrl } = event!.body;

    const { Items: photos } = await ClientPhoto.query(clientId, {
        filters: [
            { attr: 'albumId', eq: albumId },
        ],
    });

    if (!photos?.length) {
        throw new createError.BadRequest('Album not found.');
    }

    const { Items: [album] = [] } = await Album.query(albumId, {
        attributes: ['id', 'name', 'location', 'date'],
    });

    const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: album.name,
                    },
                    unit_amount: 5 * 100,
                },
                quantity: 1,
            },
        ],
        metadata: {
            clientId,
            albumId,
        },
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session.url;
};

export const main = middyfy(createCheckoutSession, schema);