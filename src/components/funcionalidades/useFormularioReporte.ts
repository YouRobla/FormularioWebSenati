import { useState, useEffect } from "react";
import { MainDocumentType } from "../report/constants";
import { useDNIValidation } from "../../hooks/useDNIValidation";
import { useFileManager } from "../../hooks/useFileManager";
import { useFormManager } from "../../hooks/useFormManager";
import { useCamera } from "../../hooks/useCamera";

export function useFormularioReporte() {
  const [mainDocumentType, setMainDocumentType] = useState<MainDocumentType>("DNI");
  
  // Hooks especializados
  const { isDNILoading, isAPIFailed, validateDNI } = useDNIValidation();
  const { files, addFiles, addPhoto, removeFile, clearFiles } = useFileManager();
  const { form, isLoading, resetForm, submitForm } = useFormManager();
  const { showCamera, openCamera, closeCamera, setShowCamera } = useCamera();

  const documentType = form.watch("documentType");

  // Limpiar campos cuando cambia el tipo de documento
  useEffect(() => {
    form.setValue("dni", "");
    form.setValue("nombres_apellidos", "");
    if (mainDocumentType === "DNI") {
      form.setValue("documentType", "DNI");
    } else {
      form.setValue("documentType", "" as any, { shouldValidate: false });
    }
  }, [mainDocumentType, form]);

  // Handlers simplificados
  const handleDNIChange = async (dni: string) => {
    if (documentType !== "DNI" || dni.length !== 8) return;
    await validateDNI(dni, form.setValue);
  };

  const handlePhotoCaptured = (file: File) => {
    const newFiles = addPhoto(file);
    form.setValue("files", newFiles, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = addFiles(selectedFiles);
    
    if (newFiles) {
      form.setValue("files", newFiles, { shouldValidate: true });
    }
    
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = removeFile(index);
    form.setValue("files", newFiles, { shouldValidate: true });
  };

  const handleSubmit = async (values: any) => {
    const success = await submitForm(values, files);
    if (success) {
      resetForm();
      clearFiles();
      form.setValue("files", []);
    }
  };

  return {
    form,
    files,
    isLoading,
    isDNILoading,
    isAPIFailed,
    showCamera,
    setShowCamera,
    mainDocumentType,
    setMainDocumentType,
    handleDNIChange,
    handlePhotoCaptured,
    handleFileChange,
    removeFile: handleRemoveFile,
    onSubmit: handleSubmit,
  };
}