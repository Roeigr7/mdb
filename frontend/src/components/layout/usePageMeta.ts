import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../../app/features/projects/projectsApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

export type BreadcrumbCrumb = {
  label: string;
  to?: string;
};

/**
 * Route title + breadcrumbs, with project name resolved when on /projects/:id.
 */
export function usePageMeta() {
  const { t } = useAppTranslation();
  const location = useLocation();
  const params = useParams();
  const pathname = location.pathname;

  const projectIdFromRoute = useMemo(() => {
    if (!pathname.startsWith('/projects/') || pathname === '/projects') {
      return null;
    }
    const raw = params.id ?? pathname.split('/')[2];
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [params.id, pathname]);

  const { data: project } = useGetProjectByIdQuery(projectIdFromRoute ?? 0, {
    skip: projectIdFromRoute == null,
  });

  const projectLabel =
    project?.name?.trim() || t('projectDetails.title');

  const title = useMemo(() => {
    if (projectIdFromRoute != null) return projectLabel;
    if (pathname.startsWith('/projects')) return t('projects.title');
    if (pathname.startsWith('/materials')) return t('materials.title');
    if (pathname.startsWith('/suppliers')) return t('suppliers.title');
    if (pathname.startsWith('/expenses')) return t('expenses.title');
    if (pathname.startsWith('/revenue')) return t('revenue.title');
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) {
      return t('analytics.title');
    }
    if (pathname.startsWith('/settings')) return t('settings.title');
    if (pathname.startsWith('/dashboard')) return t('dashboard.title');
    return t('header.fallbackTitle');
  }, [pathname, projectIdFromRoute, projectLabel, t]);

  const breadcrumbs = useMemo((): BreadcrumbCrumb[] => {
    const crumbs: BreadcrumbCrumb[] = [
      { label: t('nav.dashboard'), to: '/dashboard' },
    ];

    if (projectIdFromRoute != null) {
      crumbs.push({ label: t('nav.projects'), to: '/projects' });
      crumbs.push({ label: projectLabel });
      return crumbs;
    }
    if (pathname.startsWith('/projects')) {
      crumbs.push({ label: t('nav.projects') });
      return crumbs;
    }
    if (pathname.startsWith('/materials')) {
      crumbs.push({ label: t('nav.materials') });
      return crumbs;
    }
    if (pathname.startsWith('/suppliers')) {
      crumbs.push({ label: t('nav.suppliers') });
      return crumbs;
    }
    if (pathname.startsWith('/expenses')) {
      crumbs.push({ label: t('nav.expenses') });
      return crumbs;
    }
    if (pathname.startsWith('/revenue')) {
      crumbs.push({ label: t('nav.revenue') });
      return crumbs;
    }
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) {
      crumbs.push({ label: t('nav.reports') });
      return crumbs;
    }
    if (pathname.startsWith('/settings')) {
      crumbs.push({ label: t('nav.settings') });
      return crumbs;
    }
    if (pathname.startsWith('/dashboard')) {
      return [{ label: t('nav.dashboard') }];
    }
    return crumbs;
  }, [pathname, projectIdFromRoute, projectLabel, t]);

  return { title, breadcrumbs };
}
