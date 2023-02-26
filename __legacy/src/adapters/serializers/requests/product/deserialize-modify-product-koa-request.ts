import * as z from 'zod';
import { IKoaDeserializer } from '../koa-serializer';
import { UserEntity } from '@domain/use-cases/user/user.entity';
import { zodErrorToUnprocessableEntityErrorWrapper } from '@application/../../../../domain/utils/zod/zod-error-to-unprocessable-entity-error-wrapper';

export type DeserializeModifyProductKoaRequest = IKoaDeserializer<{
    authenticatedUser?: UserEntity;
    productId: number;
    productParams: {
        name: string;
    };
}>;

// TODO Move check of authentication here
export const deserializeModifyProductKoaRequest: DeserializeModifyProductKoaRequest = (ctx) => {
    const parsedData = zodErrorToUnprocessableEntityErrorWrapper(() =>
        z
            .object({
                name: z.string(),
                productId: z.string().regex(/^\d+$/).transform(Number),
            })
            .parse({
                ...ctx.request.body,
                ...ctx.params,
            }),
    );

    return {
        authenticatedUser: ctx.authenticatedUser,
        productId: parsedData.productId,
        productParams: {
            name: parsedData.name,
        },
    };
};
