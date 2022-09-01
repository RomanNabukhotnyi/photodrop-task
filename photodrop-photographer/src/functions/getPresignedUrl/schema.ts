export default {
    type: 'object',
    properties: {
        numbers: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'string',
                pattern: '^\\+\\d{10,15}$',
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