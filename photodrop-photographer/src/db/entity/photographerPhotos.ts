import { Entity } from 'dynamodb-toolbox';

import { PhotographerPhotosTable } from '../table/photographerPhotosTable';

export const PhotographerPhotos = new Entity({
    name: 'PhotographerPhotos',
    timestamps: false,
    attributes: {
        username: { partitionKey: true, type: 'string' },
        name: { sortKey: true, type: 'string' },
        date: { required: true, type: 'string' },
        location: { required: true, type: 'string' },
        photos: { type: 'set', setType: 'string' },
    },
    table: PhotographerPhotosTable,
} as const);