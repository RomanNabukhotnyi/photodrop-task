import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';


const getClient = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Item } = await Client.get({
        number,
    }, {
        attributes: ['number', 'name', 'email', 'selfie'],
    });
    
    return Item;
};

export const main = middyfy(getClient);