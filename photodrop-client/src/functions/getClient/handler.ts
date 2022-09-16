import { middyfy } from '../../libs/lambda';
import { Client } from '../../db/entity/client';


const getClient = async (event) => {
    const number: string = event.requestContext.authorizer.principalId;
    const { Item: { name, email, selfie, countryCode } } = await Client.get({
        number,
    }, {
        attributes: ['countryCode', 'name', 'email', 'selfie'],
    });
    
    return {
        number: {
            countryCode,
            phoneNumber: number.replace(countryCode, ''),
        },
        name,
        email,
        selfie,
    };
};

export const main = middyfy(getClient);