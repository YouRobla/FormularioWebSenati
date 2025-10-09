import { ENV_CONFIG } from '../config/env';

export interface ReporteData {
  tipo_documento: string;
  numero_documento: string;
  nombre_completo: string;
  correo_institucional: string;
  nombre_reportante: string;
  area_texto: string;
  tipo_reporte: string;
  relacionado_con: string;
  lugar_incidente: string;
  descripcion_observacion: string;
  evidencias: File[]; // Archivos tal como están
}

export interface ReporteResponse {
  success: boolean;
  message: string;
  numero_registro?: string;
  data?: any;
}

export class ReporteService {
  static async submitReporte(data: ReporteData): Promise<ReporteResponse> {
    try {
      // Crear FormData para enviar datos y archivos
      const formData = new FormData();
      
      // Agregar datos del formulario
      formData.append('tipo_documento', data.tipo_documento);
      formData.append('numero_documento', data.numero_documento);
      formData.append('nombre_completo', data.nombre_completo);
      formData.append('correo_institucional', data.correo_institucional);
      formData.append('nombre_reportante', data.nombre_reportante);
      formData.append('area_texto', data.area_texto);
      formData.append('tipo_reporte', data.tipo_reporte);
      formData.append('relacionado_con', data.relacionado_con);
      formData.append('lugar_incidente', data.lugar_incidente);
      formData.append('descripcion_observacion', data.descripcion_observacion);
      
      // Agregar archivos - el backend espera 'evidencias' como array
      data.evidencias.forEach((file) => {
        formData.append('evidencias', file);
      });

      // Enviar al backend
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/api/reportes`, {
        method: 'POST',
        body: formData, // El navegador establece Content-Type automáticamente
      });

      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Error al parsear respuesta del servidor
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Reporte enviado exitosamente',
        numero_registro: result.numero_registro,
        data: result.data,
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al enviar el reporte',
      };
    }
  }
}
