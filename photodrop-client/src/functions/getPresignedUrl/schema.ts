export default {
    type: 'object',
    properties: {
        number: {
            type: 'string',
        },
        fileName: {
            type: 'string',
            pattern: '^\w+$',
            minLength: 3,
            maxLength: 20,
        },
    },
    required: ['number'],
} as const;