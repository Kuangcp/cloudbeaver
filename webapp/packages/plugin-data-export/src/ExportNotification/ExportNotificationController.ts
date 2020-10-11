/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observable, computed } from 'mobx';

import { NavNodeManagerService } from '@cloudbeaver/core-app';
import { IInitializableController, injectable } from '@cloudbeaver/core-di';
import { CommonDialogService } from '@cloudbeaver/core-dialogs';
import { INotification } from '@cloudbeaver/core-events';
import { LocalizationService } from '@cloudbeaver/core-localization';
import { ErrorDetailsDialog } from '@cloudbeaver/core-notifications';
import { Deferred, EDeferredState } from '@cloudbeaver/core-utils';

import { DataExportProcessService, ExportProcess } from '../DataExportProcessService';

@injectable()
export class ExportNotificationController implements IInitializableController {
  @observable isDetailsDialogOpen = false;

  get isSuccess(): boolean {
    return this.process?.getState() === EDeferredState.RESOLVED;
  }

  get isPending(): boolean {
    return !!this.process?.isInProgress;
  }

  get process(): Deferred<string> | undefined {
    return this.task?.process;
  }

  get task(): ExportProcess | undefined {
    return this.dataExportProcessService.exportProcesses.get(this.notification.extraProps.source);
  }

  get hasDetails(): boolean {
    return !!this.process?.getRejectionReason();
  }

  @computed get sourceName(): string {
    if (!this.task) {
      return '';
    }
    if (this.task.context.containerNodePath) {
      const node = this.navNodeManagerService.getNode(this.task.context.containerNodePath);

      return `${this.localization.translate('data_transfer_exporting_table')} ${node?.name}`;
    }

    return this.localization.translate('data_transfer_exporting_sql');
  }

  get status(): string {
    switch (this.process?.getState()) {
      case EDeferredState.PENDING:
        return 'data_transfer_notification_preparation';
      case EDeferredState.CANCELLING:
        return 'ui_processing_canceling';
      case EDeferredState.RESOLVED:
        return 'data_transfer_notification_ready';
      default:
        return 'data_transfer_notification_error';
    }
  }

  get downloadUrl(): string | undefined {
    return this.dataExportProcessService.downloadUrl(this.notification.extraProps.source);
  }

  private notification!: INotification<{ source: string }>;

  constructor(
    private commonDialogService: CommonDialogService,
    private dataExportProcessService: DataExportProcessService,
    private navNodeManagerService: NavNodeManagerService,
    private localization: LocalizationService
  ) {}

  init(notification: INotification<{ source: string }>): void {
    this.notification = notification;
  }

  delete = (): void => {
    this.dataExportProcessService.delete(this.notification.extraProps.source);
    this.notification.close();
  };

  download = (): void => {
    this.dataExportProcessService.download(this.notification.extraProps.source);
    this.notification.close();
  };

  cancel = (): void => {
    this.dataExportProcessService.cancel(this.notification.extraProps.source);
  };

  showDetails= async (): Promise<void> => {
    this.isDetailsDialogOpen = true;
    try {
      this.notification.showDetails();
      await this.commonDialogService.open(ErrorDetailsDialog, this.process?.getRejectionReason());
    } finally {
      this.isDetailsDialogOpen = false;
    }
  };
}
