import { IAdapterControllers, IAdapterMiddlewares } from '@adapters/types';
import { IConfiguration, ILogger, IWebServer } from '~/domain';
import {
    IPrismaDatabase,
    prismaDatabaseFactory,
} from '@infrastructure/orm/prisma/prisma-database';
import { authenticateUserWithEmailFactory } from '@application/../domain/use-cases/authentication/authenticate-user-with-email';
import { checkBcryptPassword } from '@infrastructure/../domain/utils/encryption/check-bcrypt-password';
import { configurationFactory } from '@configuration/configuration';
import { createProductControllerFactory } from '@adapters/controllers/product/create-product.controller';
import { createProductFactory } from '@domain/use-cases/product/create-product';
import { createShopControllerFactory } from '@adapters/controllers/shop/create-shop.controller';
import { createShopFactory } from '@domain/use-cases/shop/create-shop';
import { deserializeCreateProductKoaRequest } from '@adapters/serializers/requests/product/deserialize-create-product-koa-request';
import { deserializeCreateShopKoaRequest } from '@adapters/serializers/requests/shop/deserialize-create-shop-koa-request';
import { deserializeGetShopKoaRequest } from '@adapters/serializers/requests/shop/deserialize-get-shop-koa-request';
import { deserializeGetUserPublicProfileKoaRequest } from '@adapters/serializers/requests/user/deserialize-get-user-public-profile-koa-request';
import { deserializeModifyProductKoaRequest } from '@adapters/serializers/requests/product/deserialize-modify-product-koa-request';
import { getApiStateControllerFactory } from '@adapters/controllers/api/get-api-state.controller';
import { getApiStateFactory } from '@application/../domain/use-cases/api/get-api-state';
import { getProductControllerFactory } from '@adapters/controllers/product/get-product.controller';
import { getShopControllerFactory } from '@adapters/controllers/shop/get-shop.controller';
import { getShopFactory } from '@domain/use-cases/shop/get-shop';
import { getUserDetailsFactory } from '@domain/use-cases/user/get-user-details';
import { getUserListOfFollowedShopsControllerFactory } from '@adapters/controllers/me/get-user-followed-shops.controller';
import { getUserListOfFollowedShopsFactory } from '@domain/use-cases/user/get-user-list-of-followed-shops';
import { getUserPublicProfileControllerFactory } from '@adapters/controllers/user/get-user-public-profile.controller';
import { handleAuthenticatedUserMiddlewareFactory } from '@adapters/middlewares/handle-authenticated-user.middleware';
import { handleRequestErrorsMiddlewareFactory } from '@adapters/middlewares/handle-request-errors.middleware';
import { handleRequestTrackerMiddlewareFactory } from '@adapters/middlewares/handle-request-tracker.middleware';
import { initTrackerForRequestInMemoryFactory } from '@infrastructure/tracker/init-tracker-for-request.in-memory';
import { initTrackerForRequestMixpanelFactory } from '@infrastructure/tracker/init-tracker-for-request.mixpanel';
import { koaServerFactory } from '@infrastructure/../application/webserver/koa-server';
import { localPassportStrategyFactory } from '@adapters/middlewares/passport/local.passport-strategy';
import { logInControllerFactory } from '@adapters/controllers/authentication/log-in.controller';
import { logOutControllerFactory } from '@adapters/controllers/authentication/log-out.controller';
import { modifyProductControllerFactory } from '@adapters/controllers/product/modify-product.controller';
import { modifyProductFactory } from '@domain/use-cases/product/modify-product';
import { passportDeserializerFactory } from '@adapters/serializers/authentication/passport-deserializer';
import { passportSerializer } from '@adapters/serializers/authentication/passport-serializer';
import { productRepositoryPrismaFactory } from '@infrastructure/repositories/product.prisma-repository';
import { serializeCreateProductKoaResponse } from '@adapters/serializers/requests/product/serialize-create-product-koa-response';
import { serializeCreateShopKoaResponse } from '@adapters/serializers/requests/shop/serialize-create-shop-koa-response';
import { serializeGetShopKoaResponse } from '@adapters/serializers/requests/shop/serialize-get-shop-koa-response';
import { serializeGetUserPublicProfileKoaResponse } from '@adapters/serializers/requests/user/serialize-get-user-public-profile-koa-response';
import { serializeLoginKoaResponse } from '@adapters/serializers/requests/authentication/serialize-login-koa-response';
import { serializeLogoutKoaResponse } from '@adapters/serializers/requests/authentication/serialize-logout-koa-response';
import { serializeModifyProductKoaResponse } from '@adapters/serializers/requests/product/serialize-modify-product-koa-response';
import { setResponseHeadersMiddlewareFactory } from '@adapters/middlewares/set-response-headers.middleware';
import { setupPassportStrategiesFactory } from '@infrastructure/../application/webserver/setup-passport-strategies';
import { shopRepositoryPrismaFactory } from '@infrastructure/repositories/shop.prisma-repository';
import { userRepositoryPrismaFactory } from '@infrastructure/repositories/user.prisma-repository';
import { winstonLoggerFactory } from '@infrastructure/../application/logger/winston/winston-logger';

export const getDependencies = (): {
    webserver: IWebServer;
    logger: ILogger;
    database: IPrismaDatabase;
    configuration: IConfiguration;
} => {
    const configuration = configurationFactory();
    const logger = winstonLoggerFactory(configuration);
    const prismaDatabase = prismaDatabaseFactory(configuration, logger);

    // Domain

    const initTrackerFactory = [
        initTrackerForRequestMixpanelFactory,
        initTrackerForRequestInMemoryFactory,
    ].find((strategy) => strategy.isApplicable(configuration));

    if (!initTrackerFactory) {
        throw new Error(
            `a tracker repository was not found for environment ${configuration.ENVIRONMENT}`,
        );
    }

    const initTracker = initTrackerFactory.factory(configuration);

    const productRepository = productRepositoryPrismaFactory(
        prismaDatabase.client,
    );
    const shopRepository = shopRepositoryPrismaFactory(prismaDatabase.client);
    const userRepository = userRepositoryPrismaFactory(prismaDatabase.client);

    // Use cases

    const getApiState = getApiStateFactory(configuration);
    const createShop = createShopFactory(shopRepository);
    const getShop = getShopFactory(shopRepository);
    const createProduct = createProductFactory(productRepository);
    const modifyProductById = modifyProductFactory(
        productRepository,
        shopRepository,
    );
    const getUserPublicProfile = getUserDetailsFactory(logger, userRepository);
    const authenticateUserWithEmail = authenticateUserWithEmailFactory(
        logger,
        userRepository,
        checkBcryptPassword,
    );
    const getUserListOfFollowedShops =
        getUserListOfFollowedShopsFactory(shopRepository);

    // Adapters - Controllers and middlewares

    const controllers: IAdapterControllers = {
        api: {
            getState: getApiStateControllerFactory(getApiState),
        },
        authentication: {
            logIn: logInControllerFactory(serializeLoginKoaResponse),
            logOut: logOutControllerFactory(serializeLogoutKoaResponse),
        },
        me: {
            getPrivateSettings: getUserPublicProfileControllerFactory(
                getUserPublicProfile,
                deserializeGetUserPublicProfileKoaRequest,
                serializeGetUserPublicProfileKoaResponse,
            ), // TODO Replace bad controller
            getUserListOfFollowedShops:
                getUserListOfFollowedShopsControllerFactory(
                    getUserListOfFollowedShops,
                ),
        },
        products: {
            createProduct: createProductControllerFactory(
                createProduct,
                shopRepository,
                deserializeCreateProductKoaRequest,
                serializeCreateProductKoaResponse,
            ),
            getProduct: getProductControllerFactory(productRepository),
            modifyProduct: modifyProductControllerFactory(
                modifyProductById,
                deserializeModifyProductKoaRequest,
                serializeModifyProductKoaResponse,
            ),
        },
        shops: {
            createShop: createShopControllerFactory(
                createShop,
                deserializeCreateShopKoaRequest,
                serializeCreateShopKoaResponse,
            ),
            getShop: getShopControllerFactory(
                getShop,
                deserializeGetShopKoaRequest,
                serializeGetShopKoaResponse,
            ),
        },
        users: {
            getPublicProfile: getUserPublicProfileControllerFactory(
                getUserPublicProfile,
                deserializeGetUserPublicProfileKoaRequest,
                serializeGetUserPublicProfileKoaResponse,
            ),
        },
    };

    const middlewares: IAdapterMiddlewares = {
        handleAuthenticatedUserMiddleware:
            handleAuthenticatedUserMiddlewareFactory(logger),
        handleRequestErrorsMiddleware:
            handleRequestErrorsMiddlewareFactory(logger),
        handleRequestTrackerMiddleware:
            handleRequestTrackerMiddlewareFactory(initTracker),
        setResponseHeadersMiddleware:
            setResponseHeadersMiddlewareFactory(configuration),
    };

    const setupPassportStrategies = setupPassportStrategiesFactory(
        [localPassportStrategyFactory(authenticateUserWithEmail)],
        passportSerializer,
        passportDeserializerFactory(userRepository),
    );

    // Web server

    const webserver = koaServerFactory(
        controllers,
        middlewares,
        logger,
        configuration,
        setupPassportStrategies,
    );

    return { configuration, database: prismaDatabase, logger, webserver };
};
