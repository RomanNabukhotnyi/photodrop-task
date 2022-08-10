export default {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
        },
        location:{
            type: 'string',
            minLength: 1,
            maxLength: 50,
        },
        date:{
            type: 'string',
            minLength: 1,
            maxLength: 50,
        },
    },
    required: ['name', 'location', 'date'],
} as const;