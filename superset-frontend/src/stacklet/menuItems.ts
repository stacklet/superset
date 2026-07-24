/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// Icon artwork per the Stacklet design, imported from the design system's
// dedicated icons entry point (which avoids pulling the full @stacklet/ui
// bundle into Superset).
import {
  BellSimpleIcon,
  CardsIcon,
  ChartLineIcon,
  ClockCounterClockwiseIcon,
  DatabaseIcon,
  FileCssIcon,
  GridNineIcon,
  ListMagnifyingGlassIcon,
  PlugsConnectedIcon,
  PresentationChartIcon,
  ScrollIcon,
  StarIcon,
  TagChevronIcon,
} from '@stacklet/ui/icons';
import type { NavItem } from '@stacklet/ui/v2/Sidebar';
import type {
  BootstrapUser,
  MenuData,
  MenuObjectChildProps,
} from 'src/types/bootstrapTypes';

/**
 * The sidebar renders a curated structure defined by the Stacklet design
 * (Design Kit v2, node 6820-6796) instead of mirroring Superset's backend
 * menu payload:
 *
 *   Discover    SQL Lab · Saved Queries · Query History
 *   Dashboards  Favourite · My Dashboards · All
 *   Charts      Favourite · My Charts · All
 *   Data        My Datasets · All
 *   Settings    Database Connections · Notifications · Action Log ·
 *               CSS Templates · Annotation Layers
 *
 * The sections are rendered by V2Sidebar's `grouped` variant (small group
 * labels with flat, icon-carrying items); per the design only the Settings
 * section is collapsible.
 *
 * The backend menu payload is still consulted for access control: an entry
 * only appears when its underlying list view is present in the menu the
 * backend built for the current user, so RBAC keeps working.
 */

interface SidebarLeafSpec {
  id: string;
  label: string;
  /** Icon shown next to the label. */
  Icon: NonNullable<NavItem['Icon']>;
  /**
   * Base URL of the underlying view. The entry is only shown when this URL
   * appears in the backend menu payload for the current user.
   */
  requiresUrl: string;
  /** Optional target override, e.g. a pre-filtered list view. */
  target?: (userId?: number) => string | undefined;
  /**
   * Extra base URLs (besides the target) that also keep this entry
   * highlighted — e.g. sibling tabs of the same view, so switching between
   * them doesn't drop the active state.
   */
  activePaths?: string[];
}

interface SidebarSectionSpec {
  id: string;
  label: string;
  /** Whether the section can be collapsed (per design, only Settings). */
  collapsible?: boolean;
  items: SidebarLeafSpec[];
}

// Pre-filtered list-view URLs, using the same rison filter format as the
// upstream Home page tabs (see e.g. src/features/home/DashboardTable.tsx)
// and the ListView URL filter keys of the target pages.
const favouriteOf = (base: string) => () =>
  `${base}?filters=(favorite:(label:Yes,value:!t))`;
const ownedBy = (base: string) => (userId?: number) =>
  userId === undefined
    ? undefined
    : `${base}?filters=(owners:(label:Me,value:${userId}))`;

const SECTIONS: SidebarSectionSpec[] = [
  {
    id: 'discover',
    label: 'Discover',
    items: [
      {
        id: 'sql-lab',
        label: 'SQL Lab',
        Icon: DatabaseIcon,
        requiresUrl: '/sqllab/',
      },
      {
        id: 'saved-queries',
        label: 'Saved Queries',
        Icon: ListMagnifyingGlassIcon,
        requiresUrl: '/savedqueryview/list/',
      },
      {
        id: 'query-history',
        label: 'Query History',
        Icon: ClockCounterClockwiseIcon,
        requiresUrl: '/sqllab/history/',
      },
    ],
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    items: [
      {
        id: 'favourite',
        label: 'Favourite',
        Icon: StarIcon,
        requiresUrl: '/dashboard/list/',
        target: favouriteOf('/dashboard/list/'),
      },
      {
        id: 'my-dashboards',
        label: 'My Dashboards',
        Icon: PresentationChartIcon,
        requiresUrl: '/dashboard/list/',
        target: ownedBy('/dashboard/list/'),
      },
      {
        id: 'all',
        label: 'All',
        Icon: CardsIcon,
        requiresUrl: '/dashboard/list/',
      },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    items: [
      {
        id: 'favourite',
        label: 'Favourite',
        Icon: StarIcon,
        requiresUrl: '/chart/list/',
        target: favouriteOf('/chart/list/'),
      },
      {
        id: 'my-charts',
        label: 'My Charts',
        Icon: ChartLineIcon,
        requiresUrl: '/chart/list/',
        target: ownedBy('/chart/list/'),
      },
      { id: 'all', label: 'All', Icon: CardsIcon, requiresUrl: '/chart/list/' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      {
        id: 'my-datasets',
        label: 'My Datasets',
        Icon: GridNineIcon,
        requiresUrl: '/tablemodelview/list/',
        target: ownedBy('/tablemodelview/list/'),
      },
      {
        id: 'all',
        label: 'All',
        Icon: CardsIcon,
        requiresUrl: '/tablemodelview/list/',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    collapsible: true,
    items: [
      {
        id: 'database-connections',
        label: 'Database Connections',
        Icon: PlugsConnectedIcon,
        requiresUrl: '/databaseview/list/',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        Icon: BellSimpleIcon,
        // Superset's Alerts & Reports; only present in the backend menu when
        // the ALERT_REPORTS feature flag is enabled, so RBAC-by-URL hides it
        // otherwise. Alerts (/alert/list/) and Reports (/report/list/) are two
        // tabs of the same view — stay highlighted across both.
        requiresUrl: '/alert/list/',
        activePaths: ['/report/list/'],
      },
      {
        id: 'action-log',
        label: 'Action Log',
        Icon: ScrollIcon,
        // no trailing slash: isFrontendRoute() matches route keys exactly and
        // this is the one list route registered without one (routes.tsx)
        requiresUrl: '/actionlog/list',
      },
      {
        id: 'css-templates',
        label: 'CSS Templates',
        Icon: FileCssIcon,
        requiresUrl: '/csstemplatemodelview/list/',
      },
      {
        id: 'annotation-layers',
        label: 'Annotation Layers',
        Icon: TagChevronIcon,
        requiresUrl: '/annotationlayer/list/',
      },
    ],
  },
];

const normalizeUrl = (url: string) => url.replace(/\/+$/, '');
const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

/**
 * The V2Sidebar highlights any item whose target is a path prefix of the
 * `pathname` prop, which double-highlights nested targets (SQL Lab while on
 * Query History) and pathname-sharing presets (All while on Favourite).
 * Instead of a real pathname, each nav item carries a unique virtual token
 * in `activePaths`, and the component receives the token of the single item
 * we resolved as active — tokens never prefix-match each other or real URLs.
 */
const ACTIVE_TOKEN_PREFIX = '~stacklet-active:';
const activeNavToken = (id: string) => `${ACTIVE_TOKEN_PREFIX}${id}`;
const NO_ACTIVE_TOKEN = `${ACTIVE_TOKEN_PREFIX}none`;

const getFiltersParam = (search: string) =>
  new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get(
    'filters',
  );

/**
 * Resolves which single nav item is active for the current location and
 * returns its virtual token (to be passed as the Sidebar `pathname` prop).
 *
 * Ranking: an exact path+filters match (pre-filtered presets like Favourite)
 * beats an exact path match without filters (e.g. All), which beats a plain
 * path-prefix match (e.g. SQL Lab for /sqllab/ subpages). When the location
 * carries filters that no preset matches — say the user tweaked the list
 * filters by hand — the unfiltered entry for that view wins.
 *
 * Each item is matched against its `target` and any extra `activePaths` (real
 * URLs, not the virtual token), so an entry can span sibling views — e.g.
 * Notifications stays active across both Alerts and Reports.
 */
export function resolveActiveNavToken(
  items: NavItem[],
  location: { pathname: string; search: string },
): string {
  const pathname = normalizePath(location.pathname);
  const currentFilters = getFiltersParam(location.search);

  let bestToken: string | undefined;
  let bestRank = 0;
  let bestPathLength = -1;

  items
    .flatMap(section => section.children ?? [section])
    .forEach(item => {
      // The item's own target, plus any extra real match URLs carried in
      // activePaths (the leading virtual token is skipped).
      const matchUrls = [
        ...(item.target ? [item.target] : []),
        ...(item.activePaths ?? []).filter(
          path => !path.startsWith(ACTIVE_TOKEN_PREFIX),
        ),
      ];

      matchUrls.forEach(matchUrl => {
        const [rawPath, rawQuery = ''] = matchUrl.split('?');
        const targetPath = normalizePath(rawPath);
        const targetFilters = getFiltersParam(rawQuery);

        let rank = 0;
        if (pathname === targetPath) {
          if (targetFilters) {
            rank = targetFilters === currentFilters ? 3 : 0;
          } else {
            rank = currentFilters ? 1 : 2;
          }
        } else if (!targetFilters && pathname.startsWith(`${targetPath}/`)) {
          rank = 1;
        }

        if (
          rank > bestRank ||
          (rank === bestRank && rank > 0 && targetPath.length > bestPathLength)
        ) {
          bestToken = activeNavToken(item.id);
          bestRank = rank;
          bestPathLength = targetPath.length;
        }
      });
    });

  return bestToken ?? NO_ACTIVE_TOKEN;
}

/** All URLs the backend menu payload grants the current user, normalized. */
function collectMenuUrls(data: MenuData): Set<string> {
  const urls = new Set<string>();
  const addChild = (child: MenuObjectChildProps | string) => {
    if (typeof child !== 'string' && child.url && !child.disable) {
      urls.add(normalizeUrl(child.url));
    }
  };
  [...(data.menu ?? []), ...(data.settings ?? [])].forEach(item => {
    if (!item) return;
    if (item.url) urls.add(normalizeUrl(item.url));
    (item.childs ?? []).forEach(addChild);
  });
  return urls;
}

/**
 * Builds the NavItem tree for the current user: the curated sections above,
 * restricted to the views the backend menu payload grants.
 */
export function buildNavItems(data: MenuData, user?: BootstrapUser): NavItem[] {
  const available = collectMenuUrls(data);
  const sections: NavItem[] = [];
  SECTIONS.forEach(section => {
    const children: NavItem[] = [];
    section.items.forEach(item => {
      if (!available.has(normalizeUrl(item.requiresUrl))) return;
      const target = item.target ? item.target(user?.userId) : item.requiresUrl;
      if (!target) return;
      const id = `${section.id}-${item.id}`;
      children.push({
        label: item.label,
        id,
        target,
        Icon: item.Icon,
        // The virtual token drives the component's own highlighting; the extra
        // spec paths ride along for resolveActiveNavToken (they never match a
        // virtual-token pathname, so they don't affect the component).
        activePaths: [activeNavToken(id), ...(item.activePaths ?? [])],
      });
    });
    if (children.length > 0) {
      sections.push({
        label: section.label,
        id: section.id,
        collapsible: Boolean(section.collapsible),
        children,
      });
    }
  });
  return sections;
}
