import { Entity } from 'dynamodb-toolbox';

import { PhotosTable } from '../table/photosTable';

export const Photo = new Entity({
    name: 'Photo',
    attributes: {
        albumId: { partitionKey: true, type: 'string' },
        id: { sortKey: true, type: 'string' },
    },
    table: PhotosTable,
} as const);