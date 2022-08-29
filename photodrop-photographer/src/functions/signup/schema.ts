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
            pattern: '^\\S+$',
        },
        fullName: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[A-Za-z]+\\s[A-Za-z]+$',
        },
        email:{
            type: 'string',
            format: 'email',
        },
    },
    required: ['username', 'password'],
    additionalProperties: false,
} as const;