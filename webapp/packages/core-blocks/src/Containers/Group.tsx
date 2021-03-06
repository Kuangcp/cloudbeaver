/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { forwardRef } from 'react';

import type { IContainerProps } from './IContainerProps';

interface Props extends IContainerProps {
  className?: string;
  form?: boolean;
  center?: boolean;
  box?: boolean;
}

export const Group = forwardRef<HTMLDivElement, Props>(function Group({ children, className }, ref) {
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});
