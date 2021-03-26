/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { IDatabaseDataAction } from '../IDatabaseDataAction';
import type { IDatabaseDataResult } from '../IDatabaseDataResult';
import type { IResultSetElementKey } from './ResultSet/IResultSetElementKey';

export interface IDatabaseResultDataAction<TKey, TResult extends IDatabaseDataResult>
  extends IDatabaseDataAction<TResult> {
  getCellValue: (cell: IResultSetElementKey) => any;
}
