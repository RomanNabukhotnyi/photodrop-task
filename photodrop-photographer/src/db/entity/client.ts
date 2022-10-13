import { Entity } from 'dynamodb-toolbox';

import { ClientsTable } from '../table/clientsTable';

export const Client = new Entity({
    name: 'Client',
    timestamps: false,
    attributes: {
        id: { partitionKey: true, type: 'string' },
        number: { required: true, type: 'string' },
        countryCode: { required: true, type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        selfieKey: { type: 'string' },
    },
    table: ClientsTable,
} as const);