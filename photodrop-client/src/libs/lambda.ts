import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import cors from '@middy/http-cors';
import validator from '@middy/validator';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';

const middleware = ():middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
    const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request): Promise<void> => {
        request.response = {
            statusCode: 200,
            body: JSON.stringify(request.response),
        };
    };
    const onError: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request): Promise<void> => {
        request.response.body = JSON.stringify({ 
            statusCode: request.response.statusCode,
            message: request.response.body,
        });
    };
    return {
        after,
        onError,
    };
};

export const middyfy = (handler: Handler, schema?) => {
    if (schema) {
        return middy(handler)
            .use(middyJsonBodyParser())
            .use(httpErrorHandler())
            .use(cors())
            .use(middleware())
            .use(validator({
                inputSchema: {
                    type: 'object',
                    properties: {
                        body: schema,
                    },
                    required: ['body'],
                },
            } as const));
    }
    return middy(handler)
        .use(middyJsonBodyParser())
        .use(httpErrorHandler())
        .use(cors())
        .use(middleware());
};