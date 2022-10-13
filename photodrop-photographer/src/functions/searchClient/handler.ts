import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';

import { middyfy } from '../../libs/lambda';
import { PhotographerClient } from '../../db/entity/photographerClient';
import { Client } from '../../db/entity/client';

const searchClient: APIGatewayProxyHandlerV2WithJWTAuthorizer<any> = async (event) => {
    const photographerId: string = event.requestContext.authorizer.principalId;
    const contains = event.queryStringParameters?.contains;

    const { Items: photographerClients = [] } = await PhotographerClient.query(photographerId);

    let clients = await Promise.all(photographerClients.map(async (photographerClient) => {
        const { Item: client } = await Client.get({
            id: photographerClient.clientId,
        });
        return {
            phoneNumber: client?.number.replace(client?.countryCode, ''),
            countryCode: client?.countryCode,
            name: client?.fullName,
        };
    }));

    if (contains) {
        clients = clients.filter(client => client?.countryCode?.concat(client?.phoneNumber!).includes(contains));
    }

    return clients;
};

export const main = middyfy(searchClient);