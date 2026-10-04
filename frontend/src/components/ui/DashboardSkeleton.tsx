import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function DashboardSkeleton() {
  return (
    <Stack spacing={3} className="mbd-page-enter">
      <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton
            key={key}
            variant="rounded"
            height={128}
            sx={{ flex: 1, minWidth: 0, borderRadius: 3 }}
          />
        ))}
      </Stack>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Skeleton variant="rounded" height={380} sx={{ flex: 2, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={380} sx={{ flex: 1, borderRadius: 3 }} />
      </Stack>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
    </Stack>
  );
}
