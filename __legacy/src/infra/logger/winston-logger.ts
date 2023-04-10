import winston from 'winston';

import { getCallerFile } from '@application/../../../domain/helpers/node/node';

import { IConfiguration, ILogger } from '~/domain';

import { winstonLocalFormat } from './local-format';

export const winstonLoggerFactory = (configuration: IConfiguration): ILogger => {
    const winstonLogger = winston.createLogger({
        level: configuration.API.LOG.LEVEL,
        transports: [
            new winston.transports.Console({
                format: ['development', 'test'].includes(configuration.ENVIRONMENT)
                    ? winstonLocalFormat
                    : winston.format.json(),
            }),
        ],
    });

    if (configuration.API.LOG.LEVEL === 'none') {
        winstonLogger.transports[0].silent = true;
    }

    const _buildMessage = (message: unknown) => {
        return {
            category: getCallerFile(),
            message: message,
        };
    };

    return {
        debug: (message: unknown): void => {
            winstonLogger.debug(_buildMessage(message));
        },
        error: (message: unknown): void => {
            winstonLogger.error(_buildMessage(message));
        },
        info: (message: unknown): void => {
            winstonLogger.info(_buildMessage(message));
        },
        verbose: (message: unknown): void => {
            winstonLogger.verbose(_buildMessage(message));
        },
        warn: (message: unknown): void => {
            winstonLogger.warn(_buildMessage(message));
        },
    };
};
