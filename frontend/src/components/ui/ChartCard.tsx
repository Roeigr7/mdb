import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type ChartCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  empty?: boolean;
  emptyLabel?: string;
  height?: number;
};

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  empty,
  emptyLabel,
  height = 300,
}: ChartCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, height: '100%' }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
        {empty ? (
          <Box
            sx={{
              height,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {emptyLabel}
            </Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Box>
        <Skeleton variant="text" width={220} height={36} />
        <Skeleton variant="text" width={360} height={24} />
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton
            key={key}
            variant="rounded"
            height={118}
            sx={{ flex: 1, minWidth: 0 }}
          />
        ))}
      </Stack>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5}>
        <Skeleton variant="rounded" height={360} sx={{ flex: 2 }} />
        <Skeleton variant="rounded" height={360} sx={{ flex: 1 }} />
      </Stack>
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );
}
