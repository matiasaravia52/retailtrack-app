'use client';

import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className,
  type,
  ...props
}) => {
  // Determinar la clase CSS adicional basada en el tipo de input
  let typeClass = '';
  if (type === 'checkbox') {
    typeClass = styles.checkboxInput;
  } else if (type === 'radio') {
    typeClass = styles.radioInput;
  }

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''} ${typeClass} ${
          className || ''
        }`}
        type={type}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

// Componente Select para usar con las clases CSS específicas
export const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }> = ({
  label,
  error,
  id,
  className,
  children,
  ...props
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={`${styles.input} ${styles.selectInput} ${error ? styles.inputError : ''} ${
          className || ''
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
