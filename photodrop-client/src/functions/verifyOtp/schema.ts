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
        code: {
            type: 'string',
            pattern: '^\\d{6}$',
        },
    },
    required: ['number', 'code'],
} as const;