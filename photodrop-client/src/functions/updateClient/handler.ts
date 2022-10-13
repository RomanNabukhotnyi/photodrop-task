import type { ValidatedEventAPIGatewayProxyEvent } from '../../libs/api-gateway';
import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';

import schema from './schema';

const updateClient: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const clientId: string = event!.requestContext!.authorizer!.principalId;
    const { fullName, email } = event.body;

    await Client.update({
        id: clientId,
        email,
        fullName,
    });   

    return {
        message: 'Success.',
    };
};

export const main = middyfy(updateClient, schema);