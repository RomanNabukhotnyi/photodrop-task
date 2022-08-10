export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
        },
        newNumber: {
            type: 'string',
        },
    },
    required: ['number'],
} as const;