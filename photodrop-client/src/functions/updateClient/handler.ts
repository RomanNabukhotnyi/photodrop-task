import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';
import { PhotographerClients } from '../../db/entity/photographerClients';

import schema from './schema';

const updateClient: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { name, email } = event.body;

    await Client.update({
        number,
        email,
        name,
    });   

    if (name) {
        const { Items } = await PhotographerClients.scan({
            filters: [
                { attr: 'number', eq: number },
            ],
            attributes: ['username', 'number'],
        });
    
        if (Items.length != 0) {
            for (const item of Items) {
                await PhotographerClients.update({
                    username: item.username,
                    number,
                    name,
                });
            }
        }
    }

    return {
        message: 'Success.',
    };
};

export const main = middyfy(updateClient, schema);