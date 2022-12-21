import { IKoaSerializer } from '@adapters/serializers/requests/koa-serializer';
import { UserEntity } from '@domain/use-cases/user/user.entity';

export type SerializeGetUserKoaResponse = IKoaSerializer<UserEntity>;

export const serializeGetUserPublicProfileKoaResponse: SerializeGetUserKoaResponse =
    (ctx, user) => {
        ctx.body = {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
        };
    };
