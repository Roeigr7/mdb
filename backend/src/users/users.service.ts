import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { GetUsersDto } from './dto/get-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

type PublicUser = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  hasPassword: boolean;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: GetUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          passwordHash: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: rows.map((row) => this.toPublicUser(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMe(user: JwtPayload) {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with id ${user.sub} not found`);
    }

    return this.toPublicUser(foundUser);
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.toPublicUser(user);
  }

  async updateUser(id: number, dto: UpdateUserDto, currentUser: JwtPayload) {
    this.assertSelfAccess(id, currentUser.sub);

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          passwordHash: true,
        },
      });
      return this.toPublicUser(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }
      throw error;
    }
  }

  async changePassword(
    dto: ChangePasswordDto,
    currentUser: JwtPayload,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${currentUser.sub} not found`);
    }

    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async deleteUser(id: number, currentUser: JwtPayload) {
    this.assertSelfAccess(id, currentUser.sub);

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  private toPublicUser(user: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    passwordHash: string | null;
  }): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.passwordHash),
    };
  }

  private assertSelfAccess(requestedUserId: number, authenticatedUserId: number) {
    if (authenticatedUserId !== requestedUserId) {
      throw new ForbiddenException(
        'You can only update or delete your own account',
      );
    }
  }
}
