import { AuthenticationRequiredClientError } from '@domain/use-cases/error/client/authentication-required-client-error';
import { DeserializeModifyProductKoaRequest } from '@adapters/serializers/requests/product/deserialize-modify-product-koa-request';
import { ModifyProduct } from '@domain/use-cases/product/modify-product';
import { SerializeModifyProductKoaResponse } from '@adapters/serializers/requests/product/serialize-modify-product-koa-response';

export const modifyProductControllerFactory = (
    modifyProductById: ModifyProduct,
    deserializeModifyProductKoaRequest: DeserializeModifyProductKoaRequest,
    serializeModifyProductKoaResponse: SerializeModifyProductKoaResponse,
) => {
    return async (ctx) => {
        ctx.requestTracker.requestedModifyProduct();

        const { authenticatedUser, productId, productParams } =
            deserializeModifyProductKoaRequest(ctx);

        if (!authenticatedUser) {
            throw new AuthenticationRequiredClientError();
        }

        const modifiedProduct = await modifyProductById(
            authenticatedUser,
            productId,
            productParams,
        );

        serializeModifyProductKoaResponse(ctx, modifiedProduct);
    };
};
