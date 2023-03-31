import { UnprocessableEntityClientError } from '@domain/../../../../../domain/use-cases/error/client/unprocessable-entity-client-error';

import { createMockOfInitiatedKoaContext } from '@infrastructure/../../../../../application/server/__tests__/initiated-koa-context.mock';

import { deserializeCreateShopKoaRequest } from '../deserialize-create-shop-koa-request';

describe('deserializeCreateShopKoaRequest()', () => {
    const createValidCreateShopBody = () => ({
        handle: 'the_handle',
        name: 'the_name',
    });

    test('succeeds if the request is valid', async () => {
        // Given
        const ctx = createMockOfInitiatedKoaContext({
            request: {
                body: createValidCreateShopBody(),
            },
        });

        // When
        const result = deserializeCreateShopKoaRequest(ctx);

        // Then
        expect(result).toEqual({ handle: 'the_handle', name: 'the_name' });
    });

    test('fails if no shop handle is provided', async () => {
        // Given
        const ctx = createMockOfInitiatedKoaContext({
            request: {
                body: {
                    ...createValidCreateShopBody(),
                    handle: undefined,
                },
            },
        });

        // When
        const ft = () => deserializeCreateShopKoaRequest(ctx);

        // Then
        expect(ft).toThrow(UnprocessableEntityClientError);
    });

    test('fails if no shop name is provided', async () => {
        // Given
        const ctx = createMockOfInitiatedKoaContext({
            request: {
                body: {
                    ...createValidCreateShopBody(),
                    name: undefined,
                },
            },
        });

        // When
        const ft = () => deserializeCreateShopKoaRequest(ctx);

        // Then
        expect(ft).toThrow(UnprocessableEntityClientError);
    });
});
