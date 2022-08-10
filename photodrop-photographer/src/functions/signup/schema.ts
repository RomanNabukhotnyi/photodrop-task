export default {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
        },
        password:{
            type: 'string',
            minLength: 6,
            maxLength: 15,
        },
        fullName: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
        },
        email:{
            type: 'string',
            format: 'email',
        },
    },
    required: ['username', 'password'],
} as const;