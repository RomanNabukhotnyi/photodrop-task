export default {
    type: 'object',
    properties: {
        albumName: {
            type: 'string',
        },
        numbers: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        fileName: {
            type: 'string',
        },
    },
    required: ['albumName', 'numbers'],
} as const;