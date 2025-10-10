import { useState } from 'react';
import { toast } from 'sonner';
import { MAX_FILES, MAX_FILE_SIZE, ACCEPTED_TYPES } from '../components/report/constants';

export function useFileManager() {
  const [files, setFiles] = useState<File[]>([]);

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return false;
    }

    // Validar cada archivo
    for (const file of newFiles) {
      // Solo permitir imágenes
      if (!file.type.startsWith('image/')) {
        toast.error(`Solo se permiten imágenes. Archivo rechazado: ${file.name}`);
        return false;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Tipo de imagen no soportado: ${file.name}. Use JPG, PNG, GIF, WebP, BMP, HEIC`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`El archivo ${file.name} excede los 10MB`);
        return false;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    toast.success(`${newFiles.length} imagen(es) agregada(s) correctamente`);
    return updatedFiles;
  };

  const addPhoto = (file: File) => {
    if (files.length >= MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('La foto excede los 10MB');
      return false;
    }

    const updatedFiles = [...files, file];
    setFiles(updatedFiles);
    toast.success('Foto agregada correctamente');
    return updatedFiles;
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    return updatedFiles;
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    files,
    addFiles,
    addPhoto,
    removeFile,
    clearFiles,
  };
}
