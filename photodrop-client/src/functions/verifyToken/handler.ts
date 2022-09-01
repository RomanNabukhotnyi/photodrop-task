import jwt from 'jsonwebtoken';

const verifyToken = async (event) => {
    const token = event.authorizationToken.replace('Bearer ', '');
    const methodArn = event.methodArn;
    if (!token || !methodArn) {
        throw Error('Unauthorized');
    }
    try {
        const decoded: any = jwt.verify(token, process.env.SECRET);
        return {
            principalId: decoded.number,
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