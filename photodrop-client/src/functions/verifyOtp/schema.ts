export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
        },
        newNumber: {
            type: 'string',
        },
        code: {
            type: 'string',
        },
    },
    required: ['number', 'code'],
} as const;