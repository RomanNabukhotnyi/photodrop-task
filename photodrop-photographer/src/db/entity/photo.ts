import { Entity } from 'dynamodb-toolbox';

import { PhotosTable } from '../table/photosTable';

export const Photo = new Entity({
    name: 'Photo',
    attributes: {
        id: { partitionKey: true, type: 'string' },
        albumId: { sortKey: true, type: 'string' },
    },
    table: PhotosTable,
} as const);