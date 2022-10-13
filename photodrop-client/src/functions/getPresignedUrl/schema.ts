export default {
    type: 'object',
    properties: {
        contentType: {
            type: 'string',
            pattern: '^image/\\w+$',
        },
    },
    required: ['contentType'],
    additionalProperties: false,
} as const;