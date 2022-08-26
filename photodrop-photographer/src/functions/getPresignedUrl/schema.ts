export default {
    type: 'object',
    properties: {
        albumName: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^\w+$',
        },
        numbers: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'string',
                pattern: '^\+\d{12}$',
            },
        },
        amount: {
            type: 'integer',
            minimum: 1,
        },
    },
    required: ['albumName', 'numbers', 'amount'],
} as const;