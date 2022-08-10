import { Entity } from 'dynamodb-toolbox';

import { ClientsTable } from '../table/clientsTable';

export const Client = new Entity({
    name: 'Client',
    attributes: {
        number: { partitionKey: true, type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        selfie: { type: 'string' },
        otp: { type: 'string' },
        expiryAt: { type: 'number' },
    },
    table: ClientsTable,
} as const);