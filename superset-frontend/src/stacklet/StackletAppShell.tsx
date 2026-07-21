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
import { useCallback, type ReactNode } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { css } from '@apache-superset/core/theme';

import { useUiConfig } from 'src/components/UiConfigContext';
import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';
import { useThemeContext } from 'src/theme/ThemeProvider';
import type { MenuData } from 'src/types/bootstrapTypes';
import StackletSidebar, {
  isAnonymousUser,
  useSidebarCollapsed,
} from './StackletSidebar';
import ThemeModeControl from './ThemeModeControl';

interface StackletAppShellProps {
  data: MenuData;
  isFrontendRoute?: (path?: string) => boolean;
  children: ReactNode;
}

/**
 * SPA layout shell that replaces the upstream top navbar with the Stacklet
 * sidebar: sidebar on the left (sticky, full viewport height), routed content
 * on the right. The document keeps its normal window-scroll behaviour.
 *
 * Like the upstream Menu, the navigation chrome is hidden entirely in
 * standalone/embedded contexts.
 */
export default function StackletAppShell({
  data,
  isFrontendRoute = () => false,
  children,
}: StackletAppShellProps) {
  const uiConfig = useUiConfig();
  const history = useHistory();
  const location = useLocation();
  const { themeMode } = useThemeContext();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  const navigate = useCallback(
    (url: string) => {
      if (!isFrontendRoute(url)) {
        window.location.assign(url);
        return;
      }
      const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
      // List views read their URL filters only while mounting, so switching
      // between presets of the already-mounted view (e.g. Favourite -> All
      // dashboards) needs a full load to take effect.
      if (normalize(url.split(/[?#]/)[0]) === normalize(location.pathname)) {
        window.location.assign(url);
        return;
      }
      history.push(url);
    },
    [history, isFrontendRoute, location.pathname],
  );

  const standalone = getUrlParam(URL_PARAMS.standalone);
  if (standalone || uiConfig.hideNav || isAnonymousUser(data)) {
    return <>{children}</>;
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        align-items: stretch;
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
      `}
    >
      <div
        css={css`
          position: sticky;
          top: 0;
          height: 100vh;
          flex: 0 0 auto;
          z-index: 100;
        `}
      >
        <StackletSidebar
          collapsed={collapsed}
          data={data}
          navigate={navigate}
          onToggleCollapsed={toggleCollapsed}
          pathname={location.pathname}
          search={location.search}
          themeControl={<ThemeModeControl />}
          themeMode={themeMode}
        />
      </div>
      <div
        css={css`
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
        `}
      >
        {children}
      </div>
    </div>
  );
}
