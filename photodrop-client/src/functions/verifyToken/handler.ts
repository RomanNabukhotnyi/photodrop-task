import createError from 'http-errors';
import jwt from 'jsonwebtoken';

const verifyToken = async (event) => {
    const token = event.authorizationToken.replace('Bearer ', '');
    const methodArn = event.methodArn;
    if (!token || !methodArn) {
        throw new createError.Unauthorized('Unauthorized.');
    }
    try {
        const decoded: any = jwt.verify(token, process.env.SECRET);
        let Effect = '';
        if (decoded && decoded.number) {
            Effect = 'Allow';
        } else {
            Effect = 'Deny';
        }
        return {
            principalId: decoded.number,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect,
                        Resource: methodArn,
                    },
                ],
            },
        };
    } catch (error) {
        throw new createError.BadRequest(error.message);
    }
};

export const main = verifyToken;