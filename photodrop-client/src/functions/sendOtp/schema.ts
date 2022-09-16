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
    },
    required: ['number'],
    additionalProperties: false,
} as const;