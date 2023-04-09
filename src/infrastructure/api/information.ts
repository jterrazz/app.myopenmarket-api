import { GetApiInformation } from '@domain/api/information';
import { ApiStatus } from '@domain/api/status';

export const getApiInformationFactory = (apiVersion: string): GetApiInformation => {
    return async () => {
        return {
            message: 'Hello World!',
            status: ApiStatus.Ok,
            time: new Date(),
            version: apiVersion,
        };
    };
};
