import { Injectable, NotFoundException } from '@nestjs/common';
import {
  paginationMeta,
  startOfCurrentMonth,
} from '../common/dto/list-pagination-query.dto.js';
import { TransactionSource } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

const expenseSelect = {
  id: true,
  description: true,
  category: true,
  amount: true,
  vatAmount: true,
  date: true,
  supplier: true,
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
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpenses(
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
      this.prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: expenseSelect,
      }),
      this.prisma.expense.count({ where }),
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
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

  async getExpense(projectId: number, expenseId: number, userId: number) {
    await this.assertOwnedProject(projectId, userId);
    return this.assertExpenseInProject(projectId, expenseId);
  }

  async createExpense(
    projectId: number,
    dto: CreateExpenseDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);

    if (dto.documentId != null) {
      await this.assertDocumentInProject(projectId, dto.documentId);
    }

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        category: dto.category ?? null,
        amount: dto.amount,
        vatAmount: dto.vatAmount ?? null,
        date: new Date(dto.date),
        supplier: dto.supplier ?? null,
        documentNumber: dto.documentNumber ?? null,
        documentUrl: dto.documentUrl ?? null,
        currency: dto.currency ?? null,
        paymentMethod: dto.paymentMethod ?? null,
        source: dto.source ?? TransactionSource.MANUAL,
        documentId: dto.documentId ?? null,
        projectId,
      },
      select: expenseSelect,
    });
  }

  async updateExpense(
    projectId: number,
    expenseId: number,
    dto: UpdateExpenseDto,
    userId: number,
  ) {
    await this.assertOwnedProject(projectId, userId);
    await this.assertExpenseInProject(projectId, expenseId);

    if (dto.documentId != null) {
      await this.assertDocumentInProject(projectId, dto.documentId);
    }

    return this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.vatAmount !== undefined ? { vatAmount: dto.vatAmount } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.supplier !== undefined ? { supplier: dto.supplier } : {}),
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
      select: expenseSelect,
    });
  }

  async deleteExpense(projectId: number, expenseId: number, userId: number) {
    await this.assertOwnedProject(projectId, userId);

    const result = await this.prisma.expense.deleteMany({
      where: {
        id: expenseId,
        projectId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Expense with id ${expenseId} not found`);
    }

    return {
      message: 'Expense deleted successfully',
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

  private async assertExpenseInProject(projectId: number, expenseId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        projectId,
      },
      select: expenseSelect,
    });

    if (!expense) {
      throw new NotFoundException(`Expense with id ${expenseId} not found`);
    }

    return expense;
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
