import { Entity } from 'dynamodb-toolbox';

import { ClientPhotosTable } from '../table/clientPhotosTable';

export const ClientPhotos = new Entity({
    name: 'ClientPhotos',
    timestamps: false,
    attributes: {
        number: { partitionKey: true, type: 'string' },
        url: { sortKey: true, type: 'string' },
        name: { required: true, type: 'string' },
        location: { required: true, type: 'string' },
        date: { required: true, type: 'string' },
        watermark: { required: true, type: 'boolean' },
    },
    table: ClientPhotosTable,
} as const);