export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
            pattern: '^\\+\\d{12}$',
        },
        newNumber: {
            type: 'string',
            pattern: '^\\+\\d{12}$',
        },
    },
    required: ['number'],
} as const;