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
import { getAppSelectorOptions, getSupersetAppName } from './appSelector';

jest.mock('src/utils/getBootstrapData', () => jest.fn());

const mockedBootstrap = getBootstrapData as jest.Mock;

const bootstrapWith = (common: object) =>
  mockedBootstrap.mockReturnValue({ common });

test('brands itself "AssetDB (Preview)" while the Redash-backed AssetDB exists', () => {
  bootstrapWith({
    stacklet: {
      urls: {
        console: 'https://console.acme.stacklet.io',
        redash: 'https://redash.acme.stacklet.io',
        sinistral: 'https://sinistral.acme.stacklet.io',
        superset: 'https://superset.acme.stacklet.io',
      },
    },
  });
  expect(getSupersetAppName()).toBe('AssetDB (Preview)');
  expect(getAppSelectorOptions()).toEqual([
    { label: 'AssetDB (Preview)', href: '', isBeta: false },
    {
      label: 'AssetDB',
      href: 'https://redash.acme.stacklet.io',
      isBeta: false,
    },
    {
      label: 'Console',
      href: 'https://console.acme.stacklet.io',
      isBeta: false,
    },
    { label: 'IaC', href: 'https://sinistral.acme.stacklet.io', isBeta: false },
  ]);
});

test('brands itself plain "AssetDB" when Redash is not deployed', () => {
  bootstrapWith({
    stacklet: {
      urls: {
        console: 'https://console.acme.stacklet.io',
        superset: 'https://superset.acme.stacklet.io',
      },
    },
  });
  expect(getSupersetAppName()).toBe('AssetDB');
  expect(getAppSelectorOptions()).toEqual([
    { label: 'AssetDB', href: '', isBeta: false },
    {
      label: 'Console',
      href: 'https://console.acme.stacklet.io',
      isBeta: false,
    },
  ]);
});

test('falls back to the dev platform when the payload has no stacklet.urls', () => {
  bootstrapWith({});
  // The dev fallback includes a Redash URL, so the Preview name applies
  expect(getAppSelectorOptions()).toEqual([
    { label: 'AssetDB (Preview)', href: '', isBeta: false },
    {
      label: 'AssetDB',
      href: 'https://redash.dev.stacklet.dev',
      isBeta: false,
    },
    {
      label: 'Console',
      href: 'https://console.dev.stacklet.dev',
      isBeta: false,
    },
    { label: 'IaC', href: 'https://sinistral.dev.stacklet.dev', isBeta: false },
  ]);
});
