import { Entity } from 'dynamodb-toolbox';

import { OtpsTable } from '../table/otpsTable';

export const Otp = new Entity({
    name: 'Otp',
    timestamps: false,
    attributes: {
        number: { partitionKey: true, type: 'string' },
        otp: { type: 'string' },
        expiryAt: { type: 'number' },
    },
    table: OtpsTable,
} as const);