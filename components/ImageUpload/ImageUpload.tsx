'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import styles from './ImageUpload.module.css';
import Button from '@/components/Button';

interface ImageUploadProps {
  onChange: (file: File | null, preview: string | null) => void;
  value?: string | null;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onChange, 
  value = null,
  label = 'Imagen del producto'
}) => {
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Manejar la selección de archivos
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  // Abrir el selector de archivos
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Abrir la cámara
  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Eliminar la imagen seleccionada
  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      
      <div className={styles.uploadArea}>
        {preview ? (
          <div className={styles.previewContainer}>
            <Image 
              src={preview} 
              alt="Vista previa" 
              className={styles.preview}
              width={300}
              height={200}
              style={{ objectFit: 'contain', maxHeight: '300px' }}
            />
            <button 
              type="button" 
              className={styles.removeButton} 
              onClick={handleRemoveImage}
              aria-label="Eliminar imagen"
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.placeholderContainer}>
            <div className={styles.placeholder}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>Selecciona o toma una foto</p>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.actions}>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleBrowseClick}
        >
          Seleccionar archivo
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleCameraClick}
        >
          Usar cámara
        </Button>
      </div>
      
      {error && <p className={styles.error}>{error}</p>}
      
      {/* Input oculto para seleccionar archivos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className={styles.hiddenInput} 
      />
      
      {/* Input oculto para la cámara */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className={styles.hiddenInput} 
      />
    </div>
  );
};

export default ImageUpload;
