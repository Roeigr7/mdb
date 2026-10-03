import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { GetSuppliersDto } from './dto/get-suppliers.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

const supplierSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  notes: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuppliers(userId: number, query: GetSuppliersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.SupplierWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: supplierSelect,
      }),
      this.prisma.supplier.count({ where }),
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

  async createSupplier(dto: CreateSupplierDto, userId: number) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
        userId,
      },
      select: supplierSelect,
    });
  }

  async getSupplierById(id: number, userId: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, userId },
      select: supplierSelect,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return supplier;
  }

  async updateSupplier(id: number, dto: UpdateSupplierDto, userId: number) {
    const result = await this.prisma.supplier.updateMany({
      where: { id, userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.prisma.supplier.findUniqueOrThrow({
      where: { id },
      select: supplierSelect,
    });
  }

  async deleteSupplier(id: number, userId: number) {
    const result = await this.prisma.supplier.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return { message: 'Supplier deleted successfully' };
  }
}
