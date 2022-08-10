import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';

import schema from './schema';

const updateClient: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { name, email } = event.body;
    await Client.update({
        number,
        email,
        name,
    });   
    return {
        message: 'Success.',
    };
};

export const main = middyfy(updateClient);