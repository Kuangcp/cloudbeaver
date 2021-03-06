/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import type { HeaderRendererProps } from 'react-data-grid';
import styled, { css, use } from 'reshadow';

import { StaticImage, Icon } from '@cloudbeaver/core-blocks';
import { useTranslate } from '@cloudbeaver/core-localization';
import type { SqlResultSet } from '@cloudbeaver/core-sdk';
import { composes, useStyles } from '@cloudbeaver/core-theming';
import type { SortMode } from '@cloudbeaver/plugin-data-viewer';

import { DataGridContext } from '../DataGridContext';
import { DataGridSelectionContext } from '../DataGridSelection/DataGridSelectionContext';
import { DataGridSortingContext } from '../DataGridSorting/DataGridSortingContext';

const headerStyles = css`
  table-header {
    display: flex;
    align-items: center;
    align-content: center;
    width: 100%;
    cursor: pointer;
  }
  shrink-container {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    overflow: hidden;
  }
  icon {
    display: flex;
  }
  StaticImage {
    height: 16px;
  }
  name {
    margin-left: 8px;
    font-weight: 400;
    flex-grow: 1;
  }
  
  sort-icons {
    margin-left: 4px;
    display: flex;
    padding: 2px 4px;
    flex-direction: column;
    align-content: center;
    align-items: center;
    min-width: 20px;
    box-sizing: border-box;
    cursor: pointer;
  }

  sort-icons > SortIcon {
    width: 8px;
    fill: currentColor !important;
  }
  sort-icons > SortIcon:last-child {
    transform: scaleY(-1);
  }
  sort-icons:hover > SortIcon {
    width: 9px;
  }
  sort-icons[|disabled] {
    opacity: 0.7;
    cursor: default;
  }
`;

const activeSortIcon = composes(
  css`
    Icon {
      composes: theme-text-primary from global;
    }
  `
);

interface ISortIconProps {
  active: boolean;
  className?: string;
}

const SortIcon: React.FC<ISortIconProps> = function SortIcon({ active, className }) {
  return styled(useStyles(active && activeSortIcon))(
    <Icon name="sort-arrow" viewBox="0 0 6 6" className={className} />
  );
};

function getColumn(colIdx: number, source: SqlResultSet) {
  return source.columns?.[colIdx];
}

export const TableColumnHeader: React.FC<HeaderRendererProps<any>> = observer(function TableColumnHeader({
  column: calculatedColumn,
}) {
  const dataGridContext = useContext(DataGridContext);
  const gridSortingContext = useContext(DataGridSortingContext);
  const gridSelectionContext = useContext(DataGridSelectionContext);
  const translate = useTranslate();

  if (!dataGridContext || !gridSortingContext || !gridSelectionContext) {
    throw new Error('One of the following contexts are missed(data grid context, grid sorting context, grid selection context)');
  }

  const model = dataGridContext.model;
  const columnName = calculatedColumn.name as string;
  const column = getColumn(Number(calculatedColumn.key), model.getResult(dataGridContext.resultIndex)?.data);

  const loading = model.isLoading();

  // TODO we want to get "sortable" property from SqlResultColumn data
  const sortable = model.source.results.length === 1;
  const currentSortMode = gridSortingContext.getSortMode(columnName);
  const columnTooltip = columnName + (column?.fullTypeName ? ': ' + column.fullTypeName : '');

  const handleSort = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (loading) {
      return;
    }

    let nextSort: SortMode;
    switch (currentSortMode) {
      case 'asc':
        nextSort = 'desc';
        break;
      case 'desc':
        nextSort = null;
        break;
      default:
        nextSort = 'asc';
    }
    gridSortingContext.setSortMode(columnName, nextSort, e.ctrlKey || e.metaKey);
  };

  const handleColumnSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    gridSelectionContext.selectColumn(calculatedColumn.idx, e.ctrlKey || e.metaKey);
  };

  return styled(headerStyles)(
    <table-header as="div" onClick={handleColumnSelection}>
      <shrink-container as='div' title={columnTooltip}>
        <icon as="div">
          <StaticImage icon={column?.icon} />
        </icon>
        <name as="div">{columnName}</name>
      </shrink-container>
      {sortable && (
        <sort-icons title={translate('data_grid_table_tooltip_column_header_sort')} as="div" onClick={handleSort} {...use({ disabled: loading })}>
          <SortIcon active={currentSortMode === 'asc'} />
          <SortIcon active={currentSortMode === 'desc'} />
        </sort-icons>
      )}
    </table-header>
  );
});
