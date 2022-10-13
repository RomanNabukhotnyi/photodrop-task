import { Entity } from 'dynamodb-toolbox';

import { ClientPhotosTable } from '../table/clientPhotosTable';

export const ClientPhoto = new Entity({
    name: 'ClientPhoto',
    attributes: {
        clientId: { partitionKey: true, type: 'string' },
        photoId: { sortKey: true, type: 'string' },
        albumId: { required: true, type: 'string' },
        watermark: { required: true, type: 'boolean' },
    },
    table: ClientPhotosTable,
} as const);