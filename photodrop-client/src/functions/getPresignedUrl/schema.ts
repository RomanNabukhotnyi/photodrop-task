export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
        },
        fileName: {
            type: 'string',
        },
    },
    required: ['number'],
} as const;