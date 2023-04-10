import { seedDatabaseWithShop } from '@tests/../../../seeds/seed-database-with-shop';

import { useFakeTimers, useRealTimers } from '../../../../../tests/helpers/timer';
import { e2eClient } from '../../e2e-client';

const {
    requestAgent,
    database: { client: databaseClient },
} = e2eClient();

beforeAll(() => {
    useFakeTimers();
});

afterAll(() => {
    useRealTimers();
});

describe('END TO END - GET /shops', function () {
    test('get an existing shop', async () => {
        // Given
        const { shop: shopSeed } = await seedDatabaseWithShop(databaseClient);

        // When
        const response = await requestAgent.get('/shops/' + shopSeed.handle);

        // Then
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            description: 'the_shop_description',
            handle: shopSeed.handle,
            name: 'the_shop_name',
        });
    });

    test('does not get a missing shop', async () => {
        // Given
        const deadShopHandle = 'the_dead_shop_handle';

        // When
        const response = await requestAgent.get('/shops/' + deadShopHandle);

        // Then
        expect(response.status).toEqual(404);
    });
});
