import { useState } from 'react';
import { toast } from 'sonner';
import { ReporteService, ReporteData } from '../services/reporteService';

export function useReporteSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReporte = async (formData: any, files: File[]): Promise<boolean> => {
    setIsSubmitting(true);

    try {


      const reporteData: ReporteData = {
        tipo_documento: formData.documentType,
        numero_documento: formData.dni,
        sede: formData.Sede,
        tipo_reporte: formData.tipo,
        lugar_incidente: formData.ocurrio_en,
        descripcion_observacion: formData.observacion,
        acciones_tomadas: formData.acciones_tomadas || undefined,
        evidencias: files,
      };

      // Log de depuración: datos que se enviarán al backend
      console.log('========================================');
      console.log('[Reporte] Datos del formulario completos:');
      console.log('========================================');
      console.log('FormData recibido:', formData);
      console.log('========================================');
      console.log('[Reporte] Payload a enviar al backend:');
      console.log({
        tipo_documento: reporteData.tipo_documento,
        numero_documento: reporteData.numero_documento,
        sede: reporteData.sede,
        tipo_reporte: reporteData.tipo_reporte,
        lugar_incidente: reporteData.lugar_incidente,
        descripcion_observacion: reporteData.descripcion_observacion,
        acciones_tomadas: reporteData.acciones_tomadas || '(no especificado)',
        evidencias: reporteData.evidencias.map(f => ({ 
          name: f.name, 
          type: f.type, 
          size: `${(f.size / 1024).toFixed(2)} KB` 
        }))
      });
      console.log('========================================');

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
