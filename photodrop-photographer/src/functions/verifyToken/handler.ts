import jwt from 'jsonwebtoken';
import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';

import { Photographer } from '../../db/entity/photographer';

const verifyToken: APIGatewayTokenAuthorizerHandler = async (event) => {
    const token = event.authorizationToken.replace('Bearer ', '');
    const methodArn = event.methodArn;
    if (!token || !methodArn) {
        throw Error('Unauthorized');
    }
    try {
        const decoded: any = jwt.verify(token, process.env.ACCES_SECRET!);

        const { Item: photographer } = await Photographer.get({
            id: decoded.id,
        });

        if (!photographer) {
            throw Error('Unauthorized');
        }

        return {
            principalId: decoded.id,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: methodArn,
                    },
                ],
            },
        };
    } catch (error) {
        throw Error('Unauthorized');
    }
};

export const main = verifyToken;