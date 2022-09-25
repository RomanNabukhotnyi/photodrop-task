import { Entity } from 'dynamodb-toolbox';

import { ClientsTable } from '../table/clientsTable';

export const Client = new Entity({
    name: 'Client',
    timestamps: false,
    attributes: {
        number: { partitionKey: true, type: 'string' },
        countryCode: { required: true, type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        selfie: { type: 'string' },
    },
    table: ClientsTable,
} as const);