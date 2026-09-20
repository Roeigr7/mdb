import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const httpException = this.mapPrismaError(exception);

    if (!httpException) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    }

    const status = httpException.getStatus();
    const exceptionResponse = httpException.getResponse();

    return response.status(status).json(
      typeof exceptionResponse === 'string'
        ? { statusCode: status, message: exceptionResponse }
        : exceptionResponse,
    );
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException | null {
    switch (exception.code) {
      case 'P2025':
        return new NotFoundException('Record not found');
      case 'P2003':
        return new BadRequestException('Related record does not exist');
      case 'P2002':
        return new ConflictException('Unique constraint failed');
      default:
        return null;
    }
  }
}
