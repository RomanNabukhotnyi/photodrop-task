import { Entity } from 'dynamodb-toolbox';

import { PhotographersTable } from '../table/photographersTable';

export const Photographer = new Entity({
    name: 'Photographer',
    timestamps: false,
    attributes: {
        id: { partitionKey: true, type: 'string' },
        username: { required: true, type: 'string' },
        passwordHash: { required: true },
        fullName: { type: 'string' },
        email: { type: 'string' },
        refreshToken: { type: 'string' },
    },
    table: PhotographersTable,
} as const);