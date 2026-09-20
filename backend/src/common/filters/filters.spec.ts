import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { GlobalHttpExceptionFilter } from './global-http-exception.filter.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

function createHost(url = '/test') {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  const request = { url };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

function createPrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('prisma failed', {
    code,
    clientVersion: 'test',
  });
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('maps P2002 to 409 Conflict without leaking internals', () => {
    const { host, status, json } = createHost();

    filter.catch(createPrismaError('P2002'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint failed',
      }),
    );
    expect(JSON.stringify(json.mock.calls[0][0])).not.toContain('prisma failed');
  });

  it('maps P2025 to 404 Not Found', () => {
    const { host, status, json } = createHost();

    filter.catch(createPrismaError('P2025'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      }),
    );
  });

  it('maps P2003 to 400 Bad Request', () => {
    const { host, status, json } = createHost();

    filter.catch(createPrismaError('P2003'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Related record does not exist',
      }),
    );
  });

  it('maps unknown Prisma codes to 500 without internal details', () => {
    const { host, status, json } = createHost();

    filter.catch(createPrismaError('P9999'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });
});

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();
  });

  it('formats a generic HttpException response', () => {
    const { host, status, json } = createHost('/users');

    filter.catch(new HttpException('Boom', HttpStatus.BAD_GATEWAY), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Boom',
        error: 'Error',
        path: '/users',
      }),
    );
    expect(json.mock.calls[0][0].timestamp).toEqual(expect.any(String));
  });

  it('formats BadRequestException validation errors', () => {
    const { host, json } = createHost('/auth/register');

    filter.catch(
      new BadRequestException({
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
        path: '/auth/register',
      }),
    );
  });

  it('formats UnauthorizedException', () => {
    const { host, json } = createHost('/auth/login');

    filter.catch(new UnauthorizedException('Invalid credentials'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      }),
    );
  });

  it('formats ForbiddenException', () => {
    const { host, json } = createHost('/users');

    filter.catch(new ForbiddenException('Insufficient permissions'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Insufficient permissions',
        error: 'Forbidden',
      }),
    );
  });

  it('formats NotFoundException and ConflictException', () => {
    const notFoundHost = createHost('/projects/1');
    filter.catch(new NotFoundException('Project not found'), notFoundHost.host);
    expect(notFoundHost.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
      }),
    );

    const conflictHost = createHost('/auth/register');
    filter.catch(new ConflictException('Email is already registered'), conflictHost.host);
    expect(conflictHost.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
      }),
    );
  });
});
