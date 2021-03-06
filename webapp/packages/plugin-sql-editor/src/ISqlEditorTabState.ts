/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { IDatabaseExecutionContext } from '@cloudbeaver/plugin-data-viewer';

export interface ISqlQueryParams extends IDatabaseExecutionContext {
  query: string;
}

export interface IResultExecutionInfo {
  resultTabId: string; // to store tableView in tableViewStore
  indexInResultSet: number;
  sqlQueryParams: ISqlQueryParams;
}

export interface IResultDataTab {
  resultTabId: string; // to store tableView in tableViewStore
  // when query return several results they all have one groupId
  // new group id generates every time you execute query in new tab
  groupId: string;
  order: number;
  indexInResultSet: number;
  name: string;
}

export interface IQueryTabGroup {
  groupId: string;
  modelId: string;
  sqlQueryParams: ISqlQueryParams;
  order: number;
}

export interface ISqlEditorTabState extends Partial<IDatabaseExecutionContext> {
  order: number;
  query: string;
  currentResultTabId?: string;
  queryTabGroups: IQueryTabGroup[];
  resultTabs: IResultDataTab[];
}
