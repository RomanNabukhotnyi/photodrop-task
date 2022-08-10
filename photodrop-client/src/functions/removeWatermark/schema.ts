export default {
    type: 'object',
    properties: {
        albumName: {
            type: 'string',
        },
        photo: {
            type: 'string',
        },
    },
    required: ['albumName', 'photo'],
} as const;