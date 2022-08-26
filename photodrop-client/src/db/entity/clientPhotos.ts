import { Entity } from 'dynamodb-toolbox';

import { ClientPhotosTable } from '../table/clientPhotosTable';

export const ClientPhotos = new Entity({
    name: 'ClientPhotos',
    timestamps: false,
    attributes: {
        number: { partitionKey: true, type: 'string' },
        url: { sortKey: true, type: 'string' },
        albumName: { required: true, type: 'string' },
        albumLocation: { required: true, type: 'string' },
        albumDate: { required: true, type: 'string' },
        watermark: { required: true, type: 'boolean' },
    },
    table: ClientPhotosTable,
} as const);