/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { PluginManifest } from '@cloudbeaver/core-di';

import { Bootstrap } from './Bootstrap';
import { DataExportMenuService } from './DataExportMenuService';
import { DataExportProcessService } from './DataExportProcessService';
import { DataExportService } from './DataExportService';
import { DataTransferProcessorsResource } from './DataTransferProcessorsResource';
import { LocaleService } from './LocaleService';

export const manifest: PluginManifest = {
  info: {
    name: 'Data Export Plugin',
  },

  providers: [
    Bootstrap,
    DataExportMenuService,
    DataExportService,
    DataExportProcessService,
    DataTransferProcessorsResource,
    LocaleService,
  ],
};
