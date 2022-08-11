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
            },
        },
        fileName: {
            type: 'string',
            pattern: '^\w+$',
            minLength: 3,
            maxLength: 20,
        },
    },
    required: ['albumName', 'numbers'],
} as const;