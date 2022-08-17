import { Entity } from 'dynamodb-toolbox';

import { PhotographerPhotosTable } from '../table/photographerPhotosTable';

export const PhotographerPhotos = new Entity({
    name: 'PhotographerPhotos',
    timestamps: false,
    attributes: {
        username: { partitionKey: true, type: 'string' },
        albumName: { sortKey: true, type: 'string' },
        albumDate: { required: true, type: 'string' },
        albumLocation: { required: true, type: 'string' },
        photos: { type: 'set', setType: 'string' },
    },
    table: PhotographerPhotosTable,
} as const);