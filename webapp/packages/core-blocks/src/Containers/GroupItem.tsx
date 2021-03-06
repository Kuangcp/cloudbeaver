/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { ILayoutSizeProps } from './ILayoutSizeProps';

interface Props extends ILayoutSizeProps {
  className?: string;
}

export const GroupItem: React.FC<Props> = function GroupItem({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
