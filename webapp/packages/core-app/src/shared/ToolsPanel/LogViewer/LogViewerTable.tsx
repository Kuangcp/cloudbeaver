/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css, use } from 'reshadow';

import { Button } from '@cloudbeaver/core-blocks';
import { useTranslate } from '@cloudbeaver/core-localization';
import { composes, useStyles } from '@cloudbeaver/core-theming';

import type { ILogEntry } from './ILogEntry';
import { LogEntry } from './LogEntry';

const styles = composes(
  css`
    type, timestamp, message {
      composes: theme-border-color-background from global;
    }
  `,
  css`
    wrapper {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    table-wrapper {
      overflow: auto;
    }
    buttons {
      padding: 16px 
    }
    table {
      flex: 1 1 auto;
      width: 100%;
      table-layout: fixed;
    }
    tr {
      border-top: 1px solid;
    }
    type, timestamp, message {
      box-sizing: border-box;
      white-space: nowrap;
      padding: 16px;
      height: 36px;
      padding-top: unset;
      padding-bottom: unset;
      text-transform: uppercase;
      text-align: left;
      text-decoration: none !important;
    }
    type {
      width: 80px;
    }
    timestamp {
      width: 180px;
    }
  `
);

interface Props {
  items: ILogEntry[];
  selectedItem: ILogEntry | null;
  onItemSelect: (item: ILogEntry) => void;
  onClear: () => void;
  className?: string;
}
export const LogViewerTable: React.FC<Props> = observer(function LogViewerTable({ items, selectedItem, onItemSelect, onClear, className }) {
  const translate = useTranslate();
  const style = useStyles(styles);

  return styled(style)(
    <wrapper as='div' className={className}>
      <buttons as="div">
        <Button mod={['unelevated']} onClick={onClear}>
          {translate('app_log_view_clear_log')}
        </Button>
      </buttons>
      <table-wrapper as="div">
        <table {...use({ expanded: !!selectedItem })}>
          <thead>
            <tr>
              <type as='th'>{translate('app_log_view_entry_type')}</type>
              <timestamp as='th'>{translate('app_log_view_entry_timestamp')}</timestamp>
              <message as='th'>{translate('app_log_view_entry_message')}</message>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <LogEntry
                key={item.id}
                item={item}
                selected={item.id === selectedItem?.id}
                onSelect={onItemSelect}
              />
            ))}
          </tbody>
        </table>
      </table-wrapper>
    </wrapper>
  );
});
