import { middyfy } from '../../libs/lambda';
import { PhotographerClients } from '../../db/entity/photographerClients';

const searchClient = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const contains = event.queryStringParameters.contains;
    const { Items } = await PhotographerClients.scan({
        filters: [
            { attr: 'username', eq: username },
            { attr: 'number', contains },
        ],
        attributes: ['number'],
    });

    return Items.map(client => (client.number)) ?? [];
};

export const main = middyfy(searchClient);