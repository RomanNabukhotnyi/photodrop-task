export default {
    type: 'object',
    properties: {
        number: {
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
        newNumber: {
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
        code: {
            type: 'string',
            pattern: '^\\d{6}$',
        },
    },
    required: ['number', 'code'],
    additionalProperties: false,
} as const;