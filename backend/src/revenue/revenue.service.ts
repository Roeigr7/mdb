import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginationMeta,
  startOfCurrentMonth,
} from '../common/dto/list-pagination-query.dto.js';
import { TransactionSource } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRevenueDto } from './dto/create-revenue.dto.js';
import { UpdateRevenueDto } from './dto/update-revenue.dto.js';

const revenueSelect = {
  id: true,
  description: true,
  customer: true,
  amount: true,
  vatAmount: true,
  date: true,
  status: true,
  documentNumber: true,
  documentUrl: true,
  currency: true,
  paymentMethod: true,
  source: true,
  projectId: true,
  documentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class RevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenues(
    projectId: number,
    userId: number,
    page = 1,
    limit = 10,
  ) {
    await this.assertOwnedProject(projectId, userId);

    const skip = (page - 1) * limit;
    const where = { projectId };
    const monthStart = startOfCurrentMonth();

    const [data, total, amountAgg, monthAgg] = await Promise.all([
      this.prisma.revenue.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: revenueSelect,
      }),
      this.prisma.revenue.count({ where }),
      this.prisma.revenue.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.revenue.aggregate({
        where: { projectId, date: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      meta: paginationMeta(page, limit, total),
      summary: {
        count: total,
        totalAmount: amountAgg._sum.amount ?? 0,
        thisMonthAmount: monthAgg._sum.amount ?? 0,
      },
    };
  }

  async getRevenue(projectId: number, revenueId: number, userId: number) {
    await this.assertOwnedProject(projectId, userId);
    return this.assertRevenueInProject(projectId, revenueId);
  }

  async createRevenue(
    projectId: number,
    dto: CreateRevenueDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);

    if (dto.documentId != null) {
      await this.assertDocumentInProject(projectId, dto.documentId);
    }

    return this.prisma.revenue.create({
      data: {
        description: dto.description,
        customer: dto.customer ?? null,
        amount: dto.amount,
        vatAmount: dto.vatAmount ?? null,
        date: new Date(dto.date),
        status: dto.status,
        documentNumber: dto.documentNumber ?? null,
        documentUrl: dto.documentUrl ?? null,
        currency: dto.currency ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        source: dto.source ?? TransactionSource.MANUAL,
        documentId: dto.documentId ?? null,
        projectId,
      },
      select: revenueSelect,
    });
  }

  async updateRevenue(
    projectId: number,
    revenueId: number,
    dto: UpdateRevenueDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);
    await this.assertRevenueInProject(projectId, revenueId);

    if (dto.documentId != null) {
      await this.assertDocumentInProject(projectId, dto.documentId);
    }

    return this.prisma.revenue.update({
      where: { id: revenueId },
      data: {
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.customer !== undefined ? { customer: dto.customer } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.vatAmount !== undefined ? { vatAmount: dto.vatAmount } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.documentNumber !== undefined
          ? { documentNumber: dto.documentNumber }
          : {}),
        ...(dto.documentUrl !== undefined
          ? { documentUrl: dto.documentUrl }
          : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.paymentMethod !== undefined
          ? { paymentMethod: dto.paymentMethod }
          : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.documentId !== undefined
          ? { documentId: dto.documentId }
          : {}),
      },
      select: revenueSelect,
    });
  }

  async deleteRevenue(projectId: number, revenueId: number, userId: number) {
    await this.assertOwnedProject(projectId, userId);

    const result = await this.prisma.revenue.deleteMany({
      where: {
        id: revenueId,
        projectId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Revenue with id ${revenueId} not found`);
    }

    return {
      message: 'Revenue deleted successfully',
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

  private async assertRevenueInProject(projectId: number, revenueId: number) {
    const revenue = await this.prisma.revenue.findFirst({
      where: {
        id: revenueId,
        projectId,
      },
      select: revenueSelect,
    });

    if (!revenue) {
      throw new NotFoundException(`Revenue with id ${revenueId} not found`);
    }

    return revenue;
  }

  private async assertDocumentInProject(
    projectId: number,
    documentId: number,
  ) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, projectId },
      select: { id: true },
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${documentId} not found`);
    }
  }
}
