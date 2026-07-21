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
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { UNSAFE_PortalProvider as PortalProvider } from 'react-aria';
import { Icons } from '@superset-ui/core/components';
import { t } from '@apache-superset/core/translation';
import { Sidebar } from '@stacklet/ui/v2/Sidebar';
import { Button } from '@stacklet/ui/v2/Button';
import { UserMenu as StackletUserMenu } from '@stacklet/ui/v2/UserMenu';
import '@fontsource-variable/dm-sans';

import getBootstrapData from 'src/utils/getBootstrapData';
import type { MenuData } from 'src/types/bootstrapTypes';
import { getAppSelectorOptions, SUPERSET_APP_NAME } from './appSelector';
import { buildNavItems, resolveActiveNavToken } from './menuItems';
// The design system's stylesheet with every rule pre-scoped under
// `.stacklet-ui-scope` — the raw dist/ui.css would restyle all of Superset
// (Tailwind preflight + global html/body rules).
import '@stacklet/ui/dist/ui.scoped.css';

/** Matches the sidebar widths baked into the V2Sidebar component. */
export const SIDEBAR_WIDTH = '13.625rem';
export const SIDEBAR_COLLAPSED_WIDTH = '4.5rem';

// The published UserMenuProps use React 19's `PropsWithChildren` (which has
// a defaulted type parameter); under this repo's @types/react@17 the
// `children` prop is lost in translation, so re-declare the component type
// with the props it actually accepts.
const UserMenu = StackletUserMenu as unknown as React.FC<{
  username: string;
  onLogout: () => void;
  onPreferences?: () => void;
  collapsed?: boolean;
  children?: React.ReactNode;
}>;

const COLLAPSED_STORAGE_KEY = 'stacklet:sidebar-collapsed';
const SECTION_STORAGE_PREFIX = 'stacklet:sidebar-section-expanded:';

function readSectionExpanded(sectionId: string): boolean {
  try {
    return localStorage.getItem(SECTION_STORAGE_PREFIX + sectionId) !== 'false';
  } catch {
    return true;
  }
}

function storeSectionExpanded(sectionId: string, expanded: boolean) {
  try {
    localStorage.setItem(SECTION_STORAGE_PREFIX + sectionId, String(expanded));
  } catch {
    // best-effort persistence only
  }
}

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Persisted collapse state shared by the SPA and menu-only entrypoints. */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const toggle = useCallback(() => {
    setCollapsed(previous => {
      const next = !previous;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // best-effort persistence only
      }
      return next;
    });
  }, []);
  return [collapsed, toggle];
}

/**
 * Whether the current visitor is not logged in. The navigation chrome is
 * hidden entirely for anonymous sessions (e.g. the login page).
 */
export function isAnonymousUser(data: MenuData): boolean {
  return Boolean(data.navbar_right?.user_is_anonymous);
}

function useCurrentUserMenu(
  data: MenuData,
  collapsed: boolean,
  themeControl?: ReactNode,
) {
  const { navbar_right: navbarRight } = data;
  const { user } = getBootstrapData();
  const fullName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : undefined;
  const username = fullName || user?.username || 'Account';
  return (
    <UserMenu
      collapsed={collapsed}
      onLogout={() => window.location.assign(navbarRight.user_logout_url)}
      username={username}
    >
      {/* The "Info" link and theme switcher carry over from the upstream
          navbar's user dropdown; Log Out is rendered by UserMenu itself. */}
      <Button
        onPress={() => window.location.assign(navbarRight.user_info_url)}
        variant="tertiary"
      >
        <Icons.InfoCircleOutlined className="size-md" /> {t('Info')}
      </Button>
      {themeControl}
      {navbarRight.version_string ? (
        <div className="text-label-small px-xl py-xs text-center text-text-secondary">
          Superset {navbarRight.version_string}
        </div>
      ) : null}
    </UserMenu>
  );
}

export interface StackletSidebarProps {
  data: MenuData;
  pathname: string;
  /** Current location query string, used to match pre-filtered list links. */
  search: string;
  navigate: (url: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /**
   * Theme switcher shown in the user menu. Supplied only by the SPA shell,
   * which mounts under `SupersetThemeProvider`; omitted by the Flask-AppBuilder
   * menu entrypoint, which has no theme context.
   */
  themeControl?: ReactNode;
}

/**
 * The Stacklet design-system sidebar wired to Superset's backend menu
 * payload. Rendered inside a `.stacklet-ui-scope` element so the scoped
 * @stacklet/ui stylesheet (dist/ui.scoped.css) applies, with react-aria
 * overlays portalled into the same scope instead of document.body.
 */
export default function StackletSidebar({
  data,
  pathname,
  search,
  navigate,
  collapsed,
  onToggleCollapsed,
  themeControl,
}: StackletSidebarProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const getPortalContainer = useCallback(() => scopeRef.current, []);
  const { user } = getBootstrapData();
  const navItems = useMemo(
    () =>
      buildNavItems(data, user).map(section => {
        // Persist the expanded state of the collapsible sections (per the
        // design, only Settings) across page loads.
        if (!section.children || !section.collapsible) return section;
        return {
          ...section,
          defaultExpanded: readSectionExpanded(section.id),
          onExpandedChange: (expanded: boolean) =>
            storeSectionExpanded(section.id, expanded),
        };
      }),
    [data, user],
  );
  const appSelectorOptions = useMemo(() => getAppSelectorOptions(), []);
  const signInMenu = useCurrentUserMenu(data, collapsed, themeControl);
  // See resolveActiveNavToken: a virtual token stands in for the pathname so
  // exactly one nav item is highlighted, query-aware for filtered presets.
  const activeToken = useMemo(
    () => resolveActiveNavToken(navItems, { pathname, search }),
    [navItems, pathname, search],
  );

  return (
    <div className="stacklet-ui-scope" ref={scopeRef}>
      <PortalProvider getContainer={getPortalContainer}>
        <Sidebar
          appSelectorOptions={appSelectorOptions}
          collapsed={collapsed}
          handleCollapsed={onToggleCollapsed}
          navItems={navItems}
          navigate={navigate}
          pathname={activeToken}
          selectedApp={SUPERSET_APP_NAME}
          SignInMenu={signInMenu}
          variant="grouped"
        />
      </PortalProvider>
    </div>
  );
}
