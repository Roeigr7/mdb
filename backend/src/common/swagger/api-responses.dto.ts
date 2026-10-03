import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Roei' })
  name: string;

  @ApiProperty({ example: 'roei@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Short-lived JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived refresh token' })
  refreshToken: string;
}

export class OAuthProvidersResponseDto {
  @ApiProperty({
    description: 'Whether Google OAuth credentials are configured',
  })
  google: boolean;

  @ApiProperty({
    description: 'Whether Facebook OAuth credentials are configured',
  })
  facebook: boolean;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Roei' })
  name: string;

  @ApiProperty({ example: 'roei@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    example: true,
    description: 'Whether the account has a local password (false for OAuth-only)',
  })
  hasPassword: boolean;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My First Project' })
  name: string;

  @ApiPropertyOptional({ example: 'A test project', nullable: true })
  description: string | null;

  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class SupplierResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'מפעל פלדה צפון' })
  name: string;

  @ApiPropertyOptional({ example: 'sales@steel.co.il', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ example: '03-1234567', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: 'ספק מועדף', nullable: true })
  notes: string | null;

  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedSuppliersResponseDto {
  @ApiProperty({ type: [SupplierResponseDto] })
  data: SupplierResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MaterialResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Iron' })
  name: string;

  @ApiProperty({ example: 500 })
  quantity: number;

  @ApiProperty({ example: 12 })
  unitPrice: number;

  @ApiPropertyOptional({ example: 'Supplier A', nullable: true })
  supplier: string | null;

  @ApiProperty({ example: 10 })
  projectId: number;

  @ApiProperty({
    example: 6000,
    description: 'Calculated as quantity × unitPrice. Not stored.',
  })
  cost: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ExpenseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'חומרי גלם' })
  description: string;

  @ApiPropertyOptional({ example: 'Materials', nullable: true })
  category: string | null;

  @ApiProperty({ example: 2500 })
  amount: number;

  @ApiPropertyOptional({ example: 375, nullable: true })
  vatAmount: number | null;

  @ApiProperty()
  date: Date;

  @ApiPropertyOptional({ example: 'ABC Ltd', nullable: true })
  supplier: string | null;

  @ApiPropertyOptional({ example: 'INV-12345', nullable: true })
  documentNumber: string | null;

  @ApiPropertyOptional({ example: 'local://10/uuid.pdf', nullable: true })
  documentUrl: string | null;

  @ApiPropertyOptional({ example: 'ILS', nullable: true })
  currency: string | null;

  @ApiPropertyOptional({ example: 'Credit Card', nullable: true })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'MANUAL',
    enum: ['MANUAL', 'SCANNED', 'IMPORTED'],
  })
  source: string;

  @ApiProperty({ example: 10 })
  projectId: number;

  @ApiPropertyOptional({ example: 3, nullable: true })
  documentId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RevenueResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'תשלום פרויקט' })
  description: string;

  @ApiPropertyOptional({ example: 'לאסם', nullable: true })
  customer: string | null;

  @ApiProperty({ example: 8500 })
  amount: number;

  @ApiPropertyOptional({ example: 1275, nullable: true })
  vatAmount: number | null;

  @ApiProperty()
  date: Date;

  @ApiProperty({ example: 'PAID', enum: ['PENDING', 'PAID', 'CANCELLED'] })
  status: string;

  @ApiPropertyOptional({ example: 'INV-99', nullable: true })
  documentNumber: string | null;

  @ApiPropertyOptional({ example: 'local://10/uuid.pdf', nullable: true })
  documentUrl: string | null;

  @ApiPropertyOptional({ example: 'ILS', nullable: true })
  currency: string | null;

  @ApiPropertyOptional({ example: 'Bank Transfer', nullable: true })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'MANUAL',
    enum: ['MANUAL', 'SCANNED', 'IMPORTED'],
  })
  source: string;

  @ApiProperty({ example: 10 })
  projectId: number;

  @ApiPropertyOptional({ example: 3, nullable: true })
  documentId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ExtractedDocumentDataDto {
  @ApiPropertyOptional({
    example: 'EXPENSE',
    enum: ['EXPENSE', 'INCOME'],
    nullable: true,
  })
  type: string | null;

  @ApiPropertyOptional({ example: 'ABC Ltd', nullable: true })
  supplier: string | null;

  @ApiPropertyOptional({ example: 1250, nullable: true })
  amount: number | null;

  @ApiPropertyOptional({ example: 212.5, nullable: true })
  vatAmount: number | null;

  @ApiPropertyOptional({ example: '2026-09-20', nullable: true })
  date: string | null;

  @ApiPropertyOptional({ example: 'INV-12345', nullable: true })
  documentNumber: string | null;

  @ApiPropertyOptional({ example: 'Materials', nullable: true })
  category: string | null;

  @ApiPropertyOptional({
    example: 'Purchase of materials',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({ example: 'ILS', nullable: true })
  currency: string | null;

  @ApiPropertyOptional({ example: 'Credit Card', nullable: true })
  paymentMethod: string | null;

  @ApiPropertyOptional({
    description: 'Per-field confidence scores between 0 and 1 when available',
  })
  fieldConfidence: Record<string, number>;
}

export class DocumentScanResponseDto {
  @ApiProperty({ example: 1 })
  documentId: number;

  @ApiProperty({ example: 'local://10/uuid.pdf' })
  documentUrl: string;

  @ApiProperty({ type: ExtractedDocumentDataDto })
  extractedData: ExtractedDocumentDataDto;

  @ApiPropertyOptional({ example: 0.92 })
  ocrConfidence?: number;
}
