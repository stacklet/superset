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
import { render, screen } from 'spec/helpers/testing-library';
import type { MenuData } from 'src/types/bootstrapTypes';
import StackletSidebar from './StackletSidebar';

const FULL_SHA = '56cb0a6d107bc5f7e732b270d7d0e66ed5bb434a';

function menuData(navbarRightOverrides: Record<string, unknown>): MenuData {
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
      ...navbarRightOverrides,
    },
    menu: [],
    settings: [],
    environment_tag: { text: '', color: '' },
  } as unknown as MenuData;
}

function renderSidebar(navbarRightOverrides: Record<string, unknown>) {
  return render(
    <StackletSidebar
      collapsed={false}
      data={menuData(navbarRightOverrides)}
      navigate={jest.fn()}
      onToggleCollapsed={jest.fn()}
      pathname="/"
      search=""
    />,
  );
}

test('shows the version and the full image SHA in the user menu', () => {
  renderSidebar({ version_string: '6.1.0', version_sha: FULL_SHA });

  expect(screen.getByText('Superset 6.1.0')).toBeInTheDocument();
  expect(screen.getByText(`SHA: ${FULL_SHA}`)).toBeInTheDocument();
});

test('shows the SHA even without a version string', () => {
  renderSidebar({ version_sha: FULL_SHA });

  expect(screen.getByText(`SHA: ${FULL_SHA}`)).toBeInTheDocument();
  expect(screen.queryByText(/^Superset /)).not.toBeInTheDocument();
});

test('omits the version block when neither version nor SHA is set', () => {
  renderSidebar({});

  expect(screen.queryByText(/^Superset /)).not.toBeInTheDocument();
  expect(screen.queryByText(/SHA:/)).not.toBeInTheDocument();
});
