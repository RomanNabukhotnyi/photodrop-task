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
        code: {
            type: 'string',
            pattern: '^\\d{6}$',
        },
    },
    required: ['number', 'code'],
} as const;