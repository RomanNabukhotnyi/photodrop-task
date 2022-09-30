export default {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
        },
        location:{
            type: 'string',
            minLength: 3,
            maxLength: 200,
        },
        date:{
            type: 'string',
            format: 'date',
        },
    },
    required: ['name', 'location', 'date'],
    additionalProperties: false,
} as const;