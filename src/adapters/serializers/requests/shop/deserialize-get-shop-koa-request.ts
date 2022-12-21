import * as z from 'zod';
import { IKoaDeserializer } from '@adapters/serializers/requests/koa-serializer';
import { Z_SHOP_HANDLE } from '@domain/use-cases/shop/shop.entity';
import { zodErrorToUnprocessableEntityErrorWrapper } from '@application/../../../../domain/utils/zod/zod-error-to-unprocessable-entity-error-wrapper';

export type DeserializeGetShopKoaRequest = IKoaDeserializer<{
    shopHandle: string;
}>;

export const deserializeGetShopKoaRequest: DeserializeGetShopKoaRequest = (
    ctx,
) => {
    return zodErrorToUnprocessableEntityErrorWrapper(() =>
        z
            .object({
                shopHandle: Z_SHOP_HANDLE,
            })
            .parse(ctx.params),
    );
};
