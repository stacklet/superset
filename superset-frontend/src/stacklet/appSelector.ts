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

/**
 * How this Superset deployment is branded in the Stacklet platform's app
 * switcher (Design Kit v2, node 6820-6796). Also part of @stacklet/ui's
 * `V2AppName` union, so it can be passed to the Sidebar without casts.
 */
export const SUPERSET_APP_NAME = 'AssetDB';

export interface StackletAppOption {
  label: string;
  href: string;
  isBeta: boolean;
}

/**
 * Sibling Stacklet apps shown in the app switcher, hardcoded to the shared
 * dev platform for the time being.
 *
 * TODO(ENG-8179 follow-up): replace with per-deployment URLs once the
 * delivery mechanism is agreed with the backend team. The sibling apps read
 * an equivalent URL map from their environment at runtime — sinistral from
 * a deploy-provisioned /config/application.json (with a committed
 * application.local.json default for dev servers), console from the
 * platform API's GraphQL UrlConfig — and this deployment should follow the
 * same pattern.
 */
const MOCKED_SIBLING_APPS: StackletAppOption[] = [
  { label: 'Console', href: 'https://console.dev.stacklet.dev', isBeta: false },
  { label: 'IaC', href: 'https://sinistral.dev.stacklet.dev', isBeta: false },
];

/**
 * Builds the app switcher entries for the Stacklet sidebar. Superset itself
 * (branded AssetDB) is always present and selected.
 */
export function getAppSelectorOptions(): StackletAppOption[] {
  return [
    { label: SUPERSET_APP_NAME, href: '', isBeta: false },
    ...MOCKED_SIBLING_APPS,
  ];
}
