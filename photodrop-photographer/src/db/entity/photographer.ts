import { Entity } from 'dynamodb-toolbox';

import { PhotographersTable } from '../table/photographersTable';

export const Photographer = new Entity({
    name: 'Photographer',
    attributes: {
        username: { partitionKey: true, type: 'string' },
        passwordHash: { required: true },
        fullName: { type: 'string' },
        email: { type: 'string' },
        refreshToken: { type: 'string' },
    },
    table: PhotographersTable,
} as const);