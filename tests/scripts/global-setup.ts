require('tsconfig-paths/register');

import { initDependencies } from '@configuration/dependencies';

module.exports = async () => {
    const { database, logger } = initDependencies();

    logger.info('connecting to test database');
    await database.connect();
    logger.info('connected to test database');
};
