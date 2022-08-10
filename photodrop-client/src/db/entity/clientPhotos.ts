import { Entity } from 'dynamodb-toolbox';

import { ClientPhotosTable } from '../table/clientPhotosTable';

export const ClientPhotos = new Entity({
    name: 'ClientPhotos',
    attributes: {
        number: { partitionKey: true, type: 'string' },
        albumName: { sortKey: true, type: 'string' },
        albumLocation: { required: true, type: 'string' },
        albumDate: { required: true, type: 'string' },
        photos: { type: 'list' },
    },
    table: ClientPhotosTable,
} as const);