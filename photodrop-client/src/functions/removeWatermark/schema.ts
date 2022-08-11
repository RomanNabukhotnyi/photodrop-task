export default {
    type: 'object',
    properties: {
        albumName: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^\w+$',
        },
        photo: {
            type: 'string',
        },
    },
    required: ['albumName', 'photo'],
} as const;