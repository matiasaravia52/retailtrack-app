'use client';

import React, { ReactNode } from 'react';
import styles from './Table.module.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function Table<T>({ 
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
}: TableProps<T>): React.ReactElement {
  if (!data.length) {
    return <div className={styles.noData}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={styles.tableHeaderCell}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={styles.tableRow}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((column) => {
                const value = item[column.key as keyof typeof item];
                return (
                  <td key={`${keyExtractor(item)}-${column.key}`} className={styles.tableCell}>
                    {column.render
                      ? column.render(value, item)
                      : (value as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
