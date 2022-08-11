export default {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^[A-Za-z_]+$',
        },
        password:{
            type: 'string',
            minLength: 8,
            maxLength: 20,
            pattern: '^\S+$',
        },
    },
    required: ['username', 'password'],
} as const;