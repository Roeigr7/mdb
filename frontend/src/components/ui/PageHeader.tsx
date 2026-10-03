import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { tokens } from '../../app/theme';

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  /** Hide the large title when the app header already shows it */
  hideTitle?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  hideTitle = false,
}: PageHeaderProps) {
  if (hideTitle && !subtitle && !actions && !breadcrumbs) {
    return null;
  }

  return (
    <Stack spacing={1.25}>
      {breadcrumbs}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {!hideTitle && (
            <Typography
              variant="h4"
              component="h1"
              sx={{ mb: subtitle ? 0.5 : 0, fontSize: { xs: '1.25rem', sm: '1.375rem' } }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 640, lineHeight: 1.55 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ flexShrink: 0 }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  ActionComponent?: React.ElementType;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  ActionComponent = Button,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 7,
        px: 3,
        textAlign: 'center',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(tokens.teal[600], 0.08),
            color: tokens.teal[600],
            mb: 2,
            border: `1px solid ${alpha(tokens.teal[600], 0.12)}`,
            '& .MuiSvgIcon-root': { fontSize: 24 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: actionLabel ? 2.5 : 0, maxWidth: 400, lineHeight: 1.55 }}
      >
        {description}
      </Typography>
      {actionLabel && (onAction || actionHref) && (
        <ActionComponent
          variant="contained"
          onClick={onAction}
          {...(actionHref ? { to: actionHref, component: undefined } : {})}
          href={actionHref}
        >
          {actionLabel}
        </ActionComponent>
      )}
    </Box>
  );
}

export type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(tokens.semantic.error, 0.14),
        bgcolor: tokens.semantic.errorSoft,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Button variant="outlined" color="error" onClick={onRetry}>
        {retryLabel}
      </Button>
    </Box>
  );
}
