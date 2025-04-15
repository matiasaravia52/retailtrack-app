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

// Interfaz para las opciones del select
interface SelectOption {
  id: string;
  name: string;
}

// Componente Select para usar con las clases CSS específicas
export const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement> & { 
  label?: string; 
  error?: string;
  options?: SelectOption[];
}> = ({
  label,
  error,
  id,
  className,
  children,
  options,
  ...props
}) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${styles.input} ${styles.selectInput} ${error ? styles.inputError : ''} ${
          className || ''
        }`}
        {...props}
      >
        {options ? (
          options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
