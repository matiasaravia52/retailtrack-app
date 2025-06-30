import React, { useState, useRef } from 'react';
import Button from '../Button';
import Spinner from '@/components/Spinner';
import styles from './ImportProductsModal.module.css';
import { productService, ImportResult } from '@/services/productService';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Verificar que sea un archivo CSV
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Por favor, seleccione un archivo CSV válido');
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      await productService.downloadCsvTemplate();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar la plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, seleccione un archivo CSV');
      return;
    }

    console.log('Archivo a importar:', file.name, 'Tamaño:', file.size, 'bytes');

    try {
      setIsLoading(true);
      setError(null);
      const result = await productService.importProductsFromCsv(file);
      console.log('Resultado de importación recibido:', result);
      setImportResult(result);
      if (result.success) {
        // Si la importación fue exitosa, actualizar la lista de productos
        onImportSuccess();
      }
    } catch (err) {
      console.error('Error en importación:', err);
      setError(err instanceof Error ? err.message : 'Error al importar productos');
      setImportResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Importar Productos desde CSV</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {!importResult ? (
            <>
              <p className={styles.instructions}>
                Seleccione un archivo CSV con la información de los productos a importar.
                El archivo debe tener los siguientes encabezados: name, description, categoryName, stock, retail_price, wholesale_price, status.
              </p>

              <div className={styles.templateSection}>
                <p>¿No tiene una plantilla? Descargue una plantilla de ejemplo:</p>
                <Button 
                  onClick={handleDownloadTemplate} 
                  disabled={isLoading}
                  variant="secondary"
                >
                  Descargar Plantilla
                </Button>
              </div>

              <div className={styles.fileInputContainer}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                {file && <p className={styles.fileName}>Archivo seleccionado: {file.name}</p>}
              </div>

              {error && <p className={styles.error}>{error}</p>}
            </>
          ) : (
            <div className={styles.resultContainer}>
              <h3 className={importResult.success ? styles.successTitle : styles.errorTitle}>
                {importResult.success ? 'Importación Exitosa' : 'Importación Completada con Errores'}
              </h3>
              
              <div className={styles.resultSummary}>
                <p>Total de registros procesados: {importResult.totalProcessed}</p>
                <p>Productos importados correctamente: {importResult.successCount}</p>
                <p>Registros con errores: {importResult.errorCount}</p>
              </div>
              
              {importResult.errorCount > 0 && (
                <div className={styles.errorsContainer}>
                  <h4>Errores encontrados:</h4>
                  <ul className={styles.errorsList}>
                    {importResult.errors.map((err, index) => (
                      <li key={index}>
                        <strong>Fila {err.row}:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {importResult.successCount > 0 && (
                <div className={styles.successContainer}>
                  <h4>Productos importados:</h4>
                  <ul className={styles.successList}>
                    {importResult.successItems.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner />
              <p>Procesando...</p>
            </div>
          ) : (
            <>
              {!importResult ? (
                <>
                  <Button onClick={handleClose} variant="secondary">
                    Cancelar
                  </Button>
                  <Button onClick={handleImport} disabled={!file}>
                    Importar
                  </Button>
                </>
              ) : (
                <Button onClick={handleClose}>
                  Cerrar
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;
