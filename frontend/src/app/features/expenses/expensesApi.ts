import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type { MessageResponse } from '../projects/projects.types';
import type {
  CreateExpenseRequest,
  DocumentScanResult,
  Expense,
  PaginatedExpenses,
  UpdateExpenseRequest,
} from './expenses.types';
import { EXPENSES_PAGE_SIZE } from './expenses.types';

export type GetExpensesArgs = {
  projectId: number;
  page?: number;
  limit?: number;
};

export const expensesApi = createApi({
  reducerPath: 'expensesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Expense'],
  endpoints: (builder) => ({
    getExpenses: builder.query<PaginatedExpenses, GetExpensesArgs>({
      query: ({ projectId, page = 1, limit = EXPENSES_PAGE_SIZE }) =>
        `/projects/${projectId}/expenses?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ queryArgs }) => queryArgs.projectId,
      merge: (currentCache, newItems) => {
        if (newItems.meta.page <= 1) {
          currentCache.data = newItems.data;
          currentCache.meta = newItems.meta;
          currentCache.summary = newItems.summary;
          return;
        }
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        for (const item of newItems.data) {
          if (!existingIds.has(item.id)) {
            currentCache.data.push(item);
          }
        }
        currentCache.meta = newItems.meta;
        currentCache.summary = newItems.summary;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.projectId !== previousArg?.projectId,
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Expense' as const,
                id,
              })),
              { type: 'Expense' as const, id: `LIST-${projectId}` },
            ]
          : [{ type: 'Expense' as const, id: `LIST-${projectId}` }],
    }),
    getExpenseById: builder.query<
      Expense,
      { projectId: number; expenseId: number }
    >({
      query: ({ projectId, expenseId }) =>
        `/projects/${projectId}/expenses/${expenseId}`,
      providesTags: (_result, _error, { expenseId }) => [
        { type: 'Expense', id: expenseId },
      ],
    }),
    scanExpenseDocument: builder.mutation<
      DocumentScanResult,
      { projectId: number; file: File }
    >({
      query: ({ projectId, file }) => {
        const body = new FormData();
        body.append('file', file);
        return {
          url: `/projects/${projectId}/expenses/scan`,
          method: 'POST',
          body,
        };
      },
    }),
    createExpense: builder.mutation<
      Expense,
      { projectId: number; body: CreateExpenseRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/expenses`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Expense', id: `LIST-${projectId}` },
      ],
    }),
    updateExpense: builder.mutation<
      Expense,
      { projectId: number; expenseId: number; body: UpdateExpenseRequest }
    >({
      query: ({ projectId, expenseId, body }) => ({
        url: `/projects/${projectId}/expenses/${expenseId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId, expenseId }) => [
        { type: 'Expense', id: expenseId },
        { type: 'Expense', id: `LIST-${projectId}` },
      ],
    }),
    deleteExpense: builder.mutation<
      MessageResponse,
      { projectId: number; expenseId: number }
    >({
      query: ({ projectId, expenseId }) => ({
        url: `/projects/${projectId}/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId, expenseId }) => [
        { type: 'Expense', id: expenseId },
        { type: 'Expense', id: `LIST-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useScanExpenseDocumentMutation,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
