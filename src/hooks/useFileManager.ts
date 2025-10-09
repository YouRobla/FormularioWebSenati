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

    for (const file of newFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`El archivo ${file.name} excede los 5MB`);
        return false;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    return updatedFiles;
  };

  const addPhoto = (file: File) => {
    const updatedFiles = [...files, file];
    setFiles(updatedFiles);
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
