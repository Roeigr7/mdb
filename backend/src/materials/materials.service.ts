import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { paginationMeta } from '../common/dto/list-pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';

const materialSelect = {
  id: true,
  name: true,
  quantity: true,
  unitPrice: true,
  supplier: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
} as const;

type MaterialRecord = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  supplier: string | null;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
};

function withCost(material: MaterialRecord) {
  return {
    ...material,
    cost: material.quantity * material.unitPrice,
  };
}

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMaterials(
    projectId: number,
    userId: number,
    page = 1,
    limit = 10,
  ) {
    await this.assertOwnedProject(projectId, userId);

    const skip = (page - 1) * limit;
    const where = { projectId };

    const [materials, total, costRows] = await Promise.all([
      this.prisma.material.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: materialSelect,
      }),
      this.prisma.material.count({ where }),
      this.prisma.$queryRaw<Array<{ total: number }>>(
        Prisma.sql`
          SELECT COALESCE(SUM(quantity * "unitPrice"), 0)::float AS total
          FROM "Material"
          WHERE "projectId" = ${projectId}
        `,
      ),
    ]);

    return {
      data: materials.map(withCost),
      meta: paginationMeta(page, limit, total),
      summary: {
        count: total,
        totalCost: Number(costRows[0]?.total ?? 0),
      },
    };
  }

  async createMaterial(
    projectId: number,
    dto: CreateMaterialDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);

    const material = await this.prisma.material.create({
      data: {
        name: dto.name,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        supplier: dto.supplier ?? null,
        projectId,
      },
      select: materialSelect,
    });

    return withCost(material);
  }

  async updateMaterial(
    projectId: number,
    materialId: number,
    dto: UpdateMaterialDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);
    await this.assertMaterialInProject(projectId, materialId);

    const material = await this.prisma.material.update({
      where: { id: materialId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
        ...(dto.unitPrice !== undefined ? { unitPrice: dto.unitPrice } : {}),
        ...(dto.supplier !== undefined ? { supplier: dto.supplier } : {}),
      },
      select: materialSelect,
    });

    return withCost(material);
  }

  async deleteMaterial(projectId: number, materialId: number, userId: number) {
    await this.assertOwnedProject(projectId, userId);

    const result = await this.prisma.material.deleteMany({
      where: {
        id: materialId,
        projectId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Material with id ${materialId} not found`);
    }

    return {
      message: 'Material deleted successfully',
    };
  }

  private async assertOwnedProject(projectId: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }
  }

  private async assertMaterialInProject(projectId: number, materialId: number) {
    const material = await this.prisma.material.findFirst({
      where: {
        id: materialId,
        projectId,
      },
      select: { id: true },
    });

    if (!material) {
      throw new NotFoundException(`Material with id ${materialId} not found`);
    }
  }
}
