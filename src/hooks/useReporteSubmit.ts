import { useState } from 'react';
import { toast } from 'sonner';
import { ReporteService, ReporteData } from '../services/reporteService';

export function useReporteSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReporte = async (formData: any, files: File[]): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Mapear datos del formulario a la estructura del backend
      const reporteData: ReporteData = {
        tipo_documento: formData.documentType,
        numero_documento: formData.dni,
        nombre_completo: formData.nombres_apellidos,
        correo_institucional: formData.correo_institucional,
        nombre_reportante: formData.reportante,
        area_texto: formData.area_id, // Valor del select (ej: "Área de Seguridad")
        tipo_reporte: formData.tipo,
        relacionado_con: formData.relacionado_a,
        lugar_incidente: formData.ocurrio_en,
        descripcion_observacion: formData.observacion,
        evidencias: files, // Archivos tal como están
      };

      const result = await ReporteService.submitReporte(reporteData);

      if (result.success) {
        toast.success(
          `¡Reporte enviado exitosamente! ${result.numero_registro ? `Número: ${result.numero_registro}` : ''}`,
          { duration: 5000 }
        );
        return true;
      } else {
        toast.error(result.message || 'Error al enviar el reporte');
        return false;
      }

    } catch (error: any) {
      toast.error(error.message || 'Error inesperado al enviar el reporte');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitReporte,
  };
}
