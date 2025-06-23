'use client';

import React, { ReactNode } from 'react';
import styles from './Table.module.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, item: T) => ReactNode;
}

interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  actions?: TableAction<T>[];
}

function Table<T>({ 
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  actions,
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
            {actions && actions.length > 0 && (
              <th className={styles.tableHeaderCell}>Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={styles.tableRow}
              onClick={onRowClick && !actions ? () => onRowClick(item) : undefined}
              style={onRowClick && !actions ? { cursor: 'pointer' } : undefined}
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
              {actions && actions.length > 0 && (
                <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                  <div className={styles.actionButtons}>
                    {actions.map((action, index) => (
                      <button
                        key={`${keyExtractor(item)}-action-${index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(item);
                        }}
                        className={`${styles.actionButton} ${action.variant ? styles[action.variant] : ''}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
