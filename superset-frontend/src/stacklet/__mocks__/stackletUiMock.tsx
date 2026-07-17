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

// Jest stand-in for the prebuilt (ESM-only) @stacklet/ui package, mapped via
// moduleNameMapper in jest.config.js. Only the exports consumed by
// src/stacklet need to exist here.
export const Sidebar = () => null;
export const UserMenu = () => null;
export const AppSelector = () => null;

// @stacklet/ui/icons (see src/stacklet/menuItems.ts)
const MockIcon = () => null;
export const CardsIcon = MockIcon;
export const ChartLineIcon = MockIcon;
export const ClockCounterClockwiseIcon = MockIcon;
export const DatabaseIcon = MockIcon;
export const FileCssIcon = MockIcon;
export const GridNineIcon = MockIcon;
export const ListMagnifyingGlassIcon = MockIcon;
export const PlugsConnectedIcon = MockIcon;
export const PresentationChartIcon = MockIcon;
export const ScrollIcon = MockIcon;
export const StarIcon = MockIcon;
export const TagChevronIcon = MockIcon;
