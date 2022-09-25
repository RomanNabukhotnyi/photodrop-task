export default {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
        },
        name: {
            type: 'string',
            pattern: '^[A-Z][a-z]*\\s[A-Z][a-z]*$',
            maxLength: 100,
        },
    },
    additionalProperties: false,
} as const;