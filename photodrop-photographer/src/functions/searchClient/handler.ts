import { middyfy } from '../../libs/lambda';
import { PhotographerClients } from '../../db/entity/photographerClients';

const searchClient = async (event) => {
    const username: string = event.requestContext.authorizer.principalId;
    const contains = event.queryStringParameters?.contains;

    let filters: any = [
        { attr: 'username', eq: username },
    ];

    if (contains) {
        filters.push({ attr: 'number', contains });
    }

    const { Items } = await PhotographerClients.scan({
        filters, 
        attributes: ['number', 'countryCode'],
    });

    return Items.map(client => ({
        countryCode: client.countryCode,
        phoneNumber: client.number.replace(client.countryCode, ''),
    })) ?? [];
};

export const main = middyfy(searchClient);