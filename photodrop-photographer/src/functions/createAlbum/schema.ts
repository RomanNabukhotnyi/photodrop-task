export default {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            pattern: '^[A-Za-z_ ]+$',
        },
        location:{
            type: 'string',
            minLength: 3,
            maxLength: 100,
            pattern: '^[A-Za-z0-9_ ]+$',
        },
        date:{
            type: 'string',
            format: 'date',
        },
    },
    required: ['name', 'location', 'date'],
    additionalProperties: false,
} as const;