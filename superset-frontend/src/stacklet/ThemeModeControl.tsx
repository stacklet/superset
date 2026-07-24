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
import type { ComponentType } from 'react';
import { Icons } from '@superset-ui/core/components';
import { t } from '@apache-superset/core/translation';
import { ThemeMode } from '@apache-superset/core/theme';
import { Button } from '@stacklet/ui/v2/Button';
import { useThemeContext } from 'src/theme/ThemeProvider';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  /** Only offered when the deployment can read the OS preference. */
  osPreference?: boolean;
}

const OPTIONS: ThemeOption[] = [
  { mode: ThemeMode.DEFAULT, label: t('Light'), Icon: Icons.SunOutlined },
  { mode: ThemeMode.DARK, label: t('Dark'), Icon: Icons.MoonOutlined },
  {
    mode: ThemeMode.SYSTEM,
    label: t('Match system'),
    Icon: Icons.FormatPainterOutlined,
    osPreference: true,
  },
];

/**
 * Light/Dark theme switcher for the sidebar user menu. Renders nothing when
 * the deployment doesn't allow changing the mode (mirrors the upstream
 * navbar, which only shows its theme submenu when `canSetMode()` is true).
 *
 * Uses `useThemeContext`, so it must be rendered under Superset's
 * `SupersetThemeProvider` (the SPA shell) — never from the Flask-AppBuilder
 * menu entrypoint, which has no such provider.
 */
export default function ThemeModeControl() {
  const { themeMode, setThemeMode, canSetMode, canDetectOSPreference } =
    useThemeContext();

  if (!canSetMode()) return null;

  const options = OPTIONS.filter(
    option => !option.osPreference || canDetectOSPreference(),
  );

  return (
    <div className="flex flex-col gap-y-1" role="group" aria-label={t('Theme')}>
      {/* px-md matches the user-menu buttons' content inset so the label
          lines up with the User info icon above it. */}
      <span className="px-md text-label-extra-small-strong text-text-secondary">
        {t('Theme')}
      </span>
      <div className="flex justify-center gap-x-3">
        {options.map(({ mode, label, Icon }) => (
          <Button
            key={mode}
            aria-label={label}
            aria-pressed={mode === themeMode}
            onPress={() => setThemeMode(mode)}
            variant={mode === themeMode ? 'tertiary' : 'plain'}
          >
            <Icon className="size-md" />
          </Button>
        ))}
      </div>
    </div>
  );
}
