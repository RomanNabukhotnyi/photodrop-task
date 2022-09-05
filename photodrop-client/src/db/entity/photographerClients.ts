import { Entity } from 'dynamodb-toolbox';

import { PhotographerClientsTable } from '../table/photographerClientsTable';

export const PhotographerClients = new Entity({
    name: 'PhotographerClients',
    timestamps: false,
    attributes: {
        username: { partitionKey: true, type: 'string' },
        number: { sortKey: true, type: 'string' },
        countryCode: { type: 'string' },
        name: { type: 'string' },
    },
    table: PhotographerClientsTable,
} as const);