import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { GetUsersDto } from './dto/get-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: GetUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
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
      },
    });

    if (!foundUser) {
      throw new NotFoundException(`User with id ${user.sub} not found`);
    }

    return foundUser;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto, currentUser: JwtPayload) {
    this.assertSelfAccess(id, currentUser.sub);

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
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

  private assertSelfAccess(requestedUserId: number, authenticatedUserId: number) {
    if (authenticatedUserId !== requestedUserId) {
      throw new ForbiddenException(
        'You can only update or delete your own account',
      );
    }
  }
}
