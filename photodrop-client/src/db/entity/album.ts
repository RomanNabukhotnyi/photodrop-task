import { Entity } from 'dynamodb-toolbox';

import { AlbumsTable } from '../table/albumsTable';

export const Album = new Entity({
    name: 'Album',
    attributes: {
        id: { partitionKey: true, type: 'string' },
        photographerId: { sortKey: true, type: 'string' },
        name: { required: true, type: 'string' },
        date: { required: true, type: 'string' },
        location: { required: true, type: 'string' },
    },
    table: AlbumsTable,
} as const);