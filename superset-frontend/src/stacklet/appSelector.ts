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
import getBootstrapData from 'src/utils/getBootstrapData';

/**
 * How this Superset deployment is branded in the Stacklet platform's app
 * switcher (Design Kit v2, node 6820-6796). Distinct from the Redash-backed
 * "AssetDB", which the other apps still link to alongside this one. Also part
 * of @stacklet/ui's `V2AppName` union, so it can be passed to the Sidebar
 * without casts.
 */
export const SUPERSET_APP_NAME = 'AssetDB v2';

export interface StackletAppOption {
  label: string;
  href: string;
  isBeta: boolean;
}

/**
 * Per-deployment app URLs injected into the common bootstrap payload by the
 * platform's superset_config.py (`COMMON_BOOTSTRAP_OVERRIDES_FUNC`, see
 * stacklet/platform#4166): the platform's shared URL map with keys such as
 * `console`, `sinistral`, `redash`, `jun0` and `superset`.
 */
interface StackletBootstrapExtras {
  stacklet?: {
    urls?: Partial<Record<string, string>>;
  };
}

/**
 * Fallback for local development, where the backend is the stock upstream
 * Superset image and injects no `stacklet.urls` into the bootstrap payload:
 * point the switcher at the shared dev platform.
 */
const DEV_FALLBACK_URLS: Partial<Record<string, string>> = {
  console: 'https://console.dev.stacklet.dev',
  sinistral: 'https://sinistral.dev.stacklet.dev',
};

/**
 * Builds the app switcher entries for the Stacklet sidebar. Superset itself
 * (branded AssetDB v2) is always present and selected; siblings appear only
 * when their URL is configured.
 */
export function getAppSelectorOptions(): StackletAppOption[] {
  const common = getBootstrapData().common as StackletBootstrapExtras;
  const urls = common?.stacklet?.urls ?? DEV_FALLBACK_URLS;
  return [
    { label: SUPERSET_APP_NAME, href: '', isBeta: false },
    ...(urls.console
      ? [{ label: 'Console', href: urls.console, isBeta: false }]
      : []),
    ...(urls.sinistral
      ? [{ label: 'IaC', href: urls.sinistral, isBeta: false }]
      : []),
  ];
}
