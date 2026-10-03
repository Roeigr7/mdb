import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { tokens } from '../../app/theme';

export type AnalyticsTableColumn<T> = {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  render: (row: T) => ReactNode;
};

export type AnalyticsDataTableProps<T> = {
  title: string;
  subtitle?: string;
  columns: AnalyticsTableColumn<T>[];
  rows: T[];
  emptyLabel: string;
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  maxHeight?: number;
};

export function AnalyticsDataTable<T>({
  title,
  subtitle,
  columns,
  rows,
  emptyLabel,
  getRowKey,
  onRowClick,
  maxHeight = 360,
}: AnalyticsDataTableProps<T>) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {rows.length === 0 ? (
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {emptyLabel}
          </Typography>
        </CardContent>
      ) : (
        <TableContainer sx={{ maxHeight, flex: 1 }}>
          <Table size="small" stickyHeader sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align ?? 'left'}
                    sx={{
                      width: column.width,
                      bgcolor: alpha(tokens.ink[900], 0.02),
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      borderBottomColor: 'divider',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align ?? 'left'}
                      sx={{ py: 1.25 }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
