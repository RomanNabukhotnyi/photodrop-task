export default {
    type: 'object',
    properties: {
        numbers: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'object',
                properties: {
                    countryCode: {
                        type: 'string',
                        pattern: '^\\+\\d{1,5}$',
                    },
                    phoneNumber: {
                        type: 'string',
                        pattern: '^\\d{9,10}$',
                    },
                },
                required: ['countryCode', 'phoneNumber'],
                additionalProperties: false,
            },
        },
        amount: {
            type: 'integer',
            minimum: 1,
        },
    },
    required: ['numbers', 'amount'],
    additionalProperties: false,
} as const;