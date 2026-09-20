import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const { message, error } = this.normalizeExceptionResponse(
      exceptionResponse,
      status,
      exception.message,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private normalizeExceptionResponse(
    exceptionResponse: string | object,
    status: number,
    fallbackMessage: string,
  ): { message: string | string[]; error: string } {
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        error: this.statusToErrorName(status),
      };
    }

    const responseBody = exceptionResponse as {
      message?: string | string[];
      error?: string;
    };

    return {
      message: responseBody.message ?? fallbackMessage,
      error: responseBody.error ?? this.statusToErrorName(status),
    };
  }

  private statusToErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
