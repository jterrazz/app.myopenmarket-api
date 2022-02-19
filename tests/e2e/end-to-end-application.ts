import { IPrismaDatabase } from '@infrastructure/orm/prisma/prisma-database';
import { IWebServer } from '@application/contracts';
import { getDependencies } from '@configuration/dependencies';

export type EndToEndApplication = {
    app: IWebServer['app'];
    database: IPrismaDatabase;
};

export const createEndToEndApplication = (): EndToEndApplication => {
    // We initiate dependencies only at the global-setup step.
    // Recreating this object would result in failure due to multiple Prisma clients
    const { database, webserver } = getDependencies();

    return {
        app: webserver.app,
        database: database as IPrismaDatabase,
    };
};
