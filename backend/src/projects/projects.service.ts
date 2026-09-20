import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { GetProjectsDto } from './dto/get-projects.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(userId: number, query: GetProjectsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProjectWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.project.count({ where }),
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

  async createProject(dto: CreateProjectDto, userId: number) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getProjectById(id: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async deleteProject(id: number, userId: number) {
    const result = await this.prisma.project.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return {
      message: 'Project deleted successfully',
    };
  }

  async updateProject(id: number, dto: UpdateProjectDto, userId: number) {
    const result = await this.prisma.project.updateMany({
      where: {
        id,
        userId,
      },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return this.prisma.project.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
