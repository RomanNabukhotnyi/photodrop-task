export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
            pattern: '^\\+\\d{10,15}$',
        },
        newNumber: {
            type: 'string',
            pattern: '^\\+\\d{10,15}$',
        },
    },
    required: ['number'],
} as const;