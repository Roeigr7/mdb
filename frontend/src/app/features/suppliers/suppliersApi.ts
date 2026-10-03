import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type {
  CreateSupplierRequest,
  GetSuppliersQuery,
  MessageResponse,
  PaginatedSuppliersResponse,
  Supplier,
  UpdateSupplierRequest,
} from './suppliers.types';

export const suppliersApi = createApi({
  reducerPath: 'suppliersApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query<
      PaginatedSuppliersResponse,
      GetSuppliersQuery | void
    >({
      query: (params) => ({
        url: '/suppliers',
        ...(params ? { params } : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Supplier' as const,
                id,
              })),
              { type: 'Supplier', id: 'LIST' },
            ]
          : [{ type: 'Supplier', id: 'LIST' }],
    }),
    getSupplierById: builder.query<Supplier, number>({
      query: (id) => `/suppliers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    updateSupplier: builder.mutation<
      Supplier,
      { id: number; body: UpdateSupplierRequest }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
    deleteSupplier: builder.mutation<MessageResponse, number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
