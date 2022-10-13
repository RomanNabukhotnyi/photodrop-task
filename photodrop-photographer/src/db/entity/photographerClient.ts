import { Entity } from 'dynamodb-toolbox';

import { PhotographerClientsTable } from '../table/photographerClientsTable';

export const PhotographerClient = new Entity({
    name: 'PhotographerClient',
    timestamps: false,
    attributes: {
        photographerId: { partitionKey: true, type: 'string' },
        clientId: { sortKey: true, type: 'string' },
    },
    table: PhotographerClientsTable,
} as const);