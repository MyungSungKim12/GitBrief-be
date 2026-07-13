import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray((payload as { message?: unknown })?.message)
          ? (payload as { message: string[] }).message.join(', ')
          : ((payload as { message?: string })?.message ??
            (exception instanceof Error
              ? exception.message
              : 'Internal server error'));
    const requestId = String(request.headers['x-request-id'] ?? randomUUID());

    response.status(status).json({
      statusCode: status,
      code: `HTTP_${status}`,
      message,
      requestId,
    });
  }
}
