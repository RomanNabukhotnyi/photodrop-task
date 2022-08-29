export default {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^\\w+$',
        },
        location:{
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^\\w+$',
        },
        date:{
            type: 'string',
            format: 'date',
        },
    },
    required: ['name', 'location', 'date'],
    additionalProperties: false,
} as const;