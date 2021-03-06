/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import { useCallback, useContext, useMemo } from 'react';
import type { CellRendererProps } from 'react-data-grid';
import { Cell } from 'react-data-grid';

import { useMouse } from '@cloudbeaver/core-blocks';
import { ResultSetFormatAction } from '@cloudbeaver/plugin-data-viewer';

import { EditingContext } from '../../Editing/EditingContext';
import { DataGridContext } from '../DataGridContext';
import { DataGridSelectionContext } from '../DataGridSelection/DataGridSelectionContext';
import { TableDataContext } from '../TableDataContext';
import { CellContext, ICellContext } from './CellContext';

export const CellRenderer: React.FC<CellRendererProps<any>> = observer(function CellRenderer(props) {
  const dataGridContext = useContext(DataGridContext);
  const tableDataContext = useContext(TableDataContext);
  const selectionContext = useContext(DataGridSelectionContext);
  const editingContext = useContext(EditingContext);
  const editor = dataGridContext?.model.source.getEditor(dataGridContext.resultIndex);
  const dataGridApi = dataGridContext?.getDataGridApi();
  const mouse = useMouse<HTMLDivElement>({});

  const classes: string[] = [];
  const { rowIdx, column } = props;

  if (selectionContext?.isSelected(rowIdx, column.idx)) {
    classes.push('rdg-cell-custom-selected');
  }

  if (editingContext?.isEditing({ idx: column.idx, rowIdx })) {
    classes.push('rdg-cell-custom-editing');
  }

  if (editor?.isCellEdited(rowIdx, Number(column.key))) {
    classes.push('rdg-cell-custom-edited');
  }

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dataGridApi) {
      dataGridApi.selectCell({ idx: column.idx, rowIdx });
    }

    selectionContext?.select(
      {
        colIdx: column.idx,
        rowIdx,
      },
      event.ctrlKey || event.metaKey,
      event.shiftKey,
      true
    );
  }, [column, rowIdx, selectionContext]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dataGridContext?.isGridInFocus()) {
      return;
    }

    selectionContext?.select(
      {
        colIdx: column.idx,
        rowIdx,
      },
      event.ctrlKey || event.metaKey,
      event.shiftKey,
      false
    );
  }, [column, rowIdx, selectionContext, dataGridContext]);

  const handleDoubleClick = useCallback(() => {
    if (!column.editable) {
      return;
    }
    const format = dataGridContext?.model.source.getAction(dataGridContext.resultIndex, ResultSetFormatAction);
    const columnIndex = tableDataContext?.getDataColumnIndexFromKey(column.key) ?? null;

    if (
      columnIndex === null
      || format?.isReadOnly({
        row: rowIdx,
        column: columnIndex,
      })
    ) {
      return;
    }

    editingContext?.edit({ idx: column.idx, rowIdx });
  }, [column, rowIdx, props.row]);

  const row = editor?.get(rowIdx) || props.row;

  const cellContext = useMemo<ICellContext>(() => ({ mouse }), [mouse]);

  return (
    <CellContext.Provider value={cellContext}>
      <Cell
        ref={mouse.reference}
        className={classes.join(' ')}
        data-row-index={rowIdx}
        data-column-index={column.idx}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        {...props}
        row={[...row]}
      />
    </CellContext.Provider>
  );
});
