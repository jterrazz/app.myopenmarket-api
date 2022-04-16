import { ClientError } from '@domain/error/client/client-error';
import { StatusCodes } from 'http-status-codes';

export class ForbiddenError extends ClientError {
    constructor(publicMessage?: string) {
        publicMessage ||= 'forbidden request';

        super(StatusCodes.FORBIDDEN, publicMessage);
    }
}
