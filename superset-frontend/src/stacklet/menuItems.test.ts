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
import type { BootstrapUser, MenuData } from 'src/types/bootstrapTypes';
import { buildNavItems, resolveActiveNavToken } from './menuItems';

const user = { userId: 7 } as BootstrapUser;

function menuDataWithUrls(urls: string[]): MenuData {
  return {
    brand: { path: '/', icon: '', alt: 'Superset', tooltip: '', text: '' },
    navbar_right: {
      show_watermark: false,
      languages: {},
      show_language_picker: false,
      user_is_anonymous: false,
      user_info_url: '/users/userinfo/',
      user_login_url: '/login/',
      user_logout_url: '/logout/',
      locale: 'en',
    },
    menu: urls.map((url, index) => ({ label: `item-${index}`, url })),
    settings: [],
    environment_tag: { text: '', color: '' },
  } as unknown as MenuData;
}

const ALL_URLS = [
  '/sqllab/',
  '/savedqueryview/list/',
  '/sqllab/history/',
  '/dashboard/list/',
  '/chart/list/',
  '/tablemodelview/list/',
  '/databaseview/list/',
  '/alert/list/',
  '/actionlog/list/',
  '/csstemplatemodelview/list/',
  '/annotationlayer/list/',
];

test('renders the full curated structure when all views are granted', () => {
  const items = buildNavItems(menuDataWithUrls(ALL_URLS), user);

  expect(items.map(section => section.label)).toEqual([
    'Discover',
    'Dashboards',
    'Charts',
    'Data',
    'Settings',
  ]);
  expect(items[0].children?.map(child => child.id)).toEqual([
    'discover-sql-lab',
    'discover-saved-queries',
    'discover-query-history',
  ]);
  expect(items[1].children?.map(child => child.id)).toEqual([
    'dashboards-favourite',
    'dashboards-my-dashboards',
    'dashboards-all',
  ]);
  expect(items[3].children?.map(child => child.id)).toEqual([
    'data-my-datasets',
    'data-all',
  ]);
  expect(items[4].children?.map(child => child.id)).toEqual([
    'settings-database-connections',
    'settings-notifications',
    'settings-action-log',
    'settings-css-templates',
    'settings-annotation-layers',
  ]);
});

test('builds filtered targets for Favourite and My entries', () => {
  const items = buildNavItems(menuDataWithUrls(ALL_URLS), user);
  const dashboards = items[1].children ?? [];

  expect(dashboards[0].target).toBe(
    '/dashboard/list/?filters=(favorite:(label:Yes,value:!t))',
  );
  expect(dashboards[1].target).toBe(
    '/dashboard/list/?filters=(owners:(label:Me,value:7))',
  );
  expect(dashboards[2].target).toBe('/dashboard/list/');
});

test('ids are unique across sections with repeated labels', () => {
  const items = buildNavItems(menuDataWithUrls(ALL_URLS), user);
  const ids = items.flatMap(section => [
    section.id,
    ...(section.children ?? []).map(child => child.id),
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});

test('drops entries and whole sections the user has no access to', () => {
  const items = buildNavItems(
    menuDataWithUrls(['/dashboard/list/', '/databaseview/list/']),
    user,
  );

  expect(items.map(section => section.label)).toEqual([
    'Dashboards',
    'Settings',
  ]);
  expect(items[1].children?.map(child => child.id)).toEqual([
    'settings-database-connections',
  ]);
});

test('matches menu URLs regardless of trailing slashes and nesting', () => {
  const data = menuDataWithUrls([]);
  data.menu = [
    { label: 'SQL', childs: [{ label: 'SQL Lab', url: '/sqllab' }] },
  ] as MenuData['menu'];
  const items = buildNavItems(data, user);
  expect(items[0].children?.map(child => child.id)).toEqual([
    'discover-sql-lab',
  ]);
});

test('omits owner-filtered entries without a user id', () => {
  const items = buildNavItems(menuDataWithUrls(ALL_URLS), undefined);
  expect(items[1].children?.map(child => child.id)).toEqual([
    'dashboards-favourite',
    'dashboards-all',
  ]);
});

test('targets frontend routes exactly, including slash-less action log', () => {
  const items = buildNavItems(menuDataWithUrls(ALL_URLS), user);
  const settings = items[4].children ?? [];
  expect(settings.find(item => item.id === 'settings-action-log')?.target).toBe(
    '/actionlog/list',
  );
});

const tokenOf = (pathname: string, search = '') =>
  resolveActiveNavToken(buildNavItems(menuDataWithUrls(ALL_URLS), user), {
    pathname,
    search,
  });

test('active resolution: nested paths only highlight the most specific entry', () => {
  expect(tokenOf('/sqllab/history/')).toBe(
    '~stacklet-active:discover-query-history',
  );
  expect(tokenOf('/sqllab/')).toBe('~stacklet-active:discover-sql-lab');
});

test('active resolution: filtered presets only highlight their own entry', () => {
  expect(
    tokenOf('/dashboard/list/', '?filters=(favorite:(label:Yes,value:!t))'),
  ).toBe('~stacklet-active:dashboards-favourite');
  expect(
    tokenOf('/dashboard/list/', '?filters=(owners:(label:Me,value:7))'),
  ).toBe('~stacklet-active:dashboards-my-dashboards');
  expect(tokenOf('/dashboard/list/')).toBe('~stacklet-active:dashboards-all');
});

test('active resolution: encoded query strings still match their preset', () => {
  expect(
    tokenOf(
      '/dashboard/list/',
      '?filters=%28favorite%3A%28label%3AYes%2Cvalue%3A%21t%29%29',
    ),
  ).toBe('~stacklet-active:dashboards-favourite');
});

test('active resolution: hand-tuned filters fall back to the unfiltered entry', () => {
  expect(
    tokenOf('/chart/list/', '?filters=(owners:(label:Someone,value:42))'),
  ).toBe('~stacklet-active:charts-all');
});

test('active resolution: unrelated locations highlight nothing', () => {
  expect(tokenOf('/superset/welcome/')).toBe('~stacklet-active:none');
});
