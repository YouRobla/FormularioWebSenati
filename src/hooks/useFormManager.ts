import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formSchema } from '../components/funcionalidades/schema';
import { useReporteSubmit } from './useReporteSubmit';

export function useFormManager() {
  const { isSubmitting, submitReporte } = useReporteSubmit();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "DNI",
      dni: "",
      nombres_apellidos: "",
      correo_institucional: "",
      reportante: "",
      area_id: "",
      tipo: "",
      relacionado_a: "",
      ocurrio_en: "",
      observacion: "",
      files: [],
    },
  });

  const resetForm = () => {
    form.reset();
  };

  const submitForm = async (data: any, files: File[]) => {
    const success = await submitReporte(data, files);
    if (success) {
      resetForm();
    }
    return success;
  };

  return {
    form,
    isLoading: isSubmitting,
    resetForm,
    submitForm,
  };
}
