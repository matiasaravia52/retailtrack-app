'use client';

import React, { ReactNode } from 'react';
import styles from './Table.module.css';

interface Column {
  key: string;
  header: string;
  render?: (value: any, item: any) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyExtractor: (item: any) => string;
  emptyMessage?: string;
  onRowClick?: (item: any) => void;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
}) => {
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
              {columns.map((column) => (
                <td key={`${keyExtractor(item)}-${column.key}`} className={styles.tableCell}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
