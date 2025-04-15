'use client';

import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button' 
}) => {
  return (
    <button
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : ''}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
