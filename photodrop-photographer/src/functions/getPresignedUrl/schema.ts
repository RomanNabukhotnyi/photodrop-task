export default {
    type: 'object',
    properties: {
        numbers: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'object',
                properties: {
                    countryCode: {
                        type: 'string',
                        pattern: '^\\+\\d{1,5}$',
                    },
                    phoneNumber: {
                        type: 'string',
                        pattern: '^\\d{9,10}$',
                    },
                },
                required: ['countryCode', 'phoneNumber'],
                additionalProperties: false,
            },
        },
        contentType: {
            type: 'string',
            pattern: '^image/\\w+$',
        },
        isLast: {
            type: 'boolean',
        },
    },
    required: ['numbers', 'contentType'],
    additionalProperties: false,
} as const;