export default {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
        },
        name: {
            type: 'string',
            pattern: '^[A-Za-z]+\\s[A-Za-z]+$',
        },
    },
    additionalProperties: false,
} as const;