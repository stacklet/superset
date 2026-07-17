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
import { useEffect } from 'react';

import type { MenuData } from 'src/types/bootstrapTypes';
import StackletSidebar, {
  isAnonymousUser,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  useSidebarCollapsed,
} from './StackletSidebar';

/**
 * Sidebar variant for backend-rendered (Flask-AppBuilder) pages, where the
 * navigation mounts into a standalone `#app-menu` element at the top of the
 * document instead of wrapping the page content. The sidebar is fixed to the
 * left edge and the page body is offset to make room for it.
 */
export default function StackletMenuApp({ data }: { data: MenuData }) {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const hidden = isAnonymousUser(data);

  useEffect(() => {
    if (hidden) return undefined;
    const previousMargin = document.body.style.marginLeft;
    document.body.style.marginLeft = collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH;
    return () => {
      document.body.style.marginLeft = previousMargin;
    };
  }, [collapsed, hidden]);

  if (hidden) return null;

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 1030 }}
    >
      <StackletSidebar
        collapsed={collapsed}
        data={data}
        navigate={url => window.location.assign(url)}
        onToggleCollapsed={toggleCollapsed}
        pathname={window.location.pathname}
        search={window.location.search}
      />
    </div>
  );
}
