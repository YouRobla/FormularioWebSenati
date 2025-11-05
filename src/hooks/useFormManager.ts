import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formSchema } from '../components/funcionalidades/schema';
import { useReporteSubmit } from './useReporteSubmit';

export function useFormManager() {
  const { isSubmitting, submitReporte } = useReporteSubmit();

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      documentType: "DNI",
      dni: "",
      Sede: "",
      tipo: "",
      ocurrio_en: "",
      observacion: "",
      acciones_tomadas: "",
      files: [],
    },
  });

  const resetForm = () => {
    form.reset({
      documentType: "DNI",
      dni: "",
      Sede: "",
      tipo: "",
      ocurrio_en: "",
      observacion: "",
      acciones_tomadas: "",
      files: [],
    });
  };

  const submitForm = async (data: any, files: File[]) => {
    const success = await submitReporte(data, files);
    return success;
  };

  return {
    form,
    isLoading: isSubmitting,
    resetForm,
    submitForm,
  };
}
