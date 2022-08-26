export default {
    type: 'object',
    properties: {
        photo: {
            type: 'string',
        },
    },
    required: ['photo'],
} as const;