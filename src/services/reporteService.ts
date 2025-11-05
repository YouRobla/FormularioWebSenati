import { ENV_CONFIG } from '../config/env';

export interface ReporteData {
  tipo_documento: string;
  numero_documento: string;
  sede: string;
  tipo_reporte: string;
  lugar_incidente: string;
  descripcion_observacion: string;
  acciones_tomadas?: string;
  evidencias: File[];
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
      // Validar archivos antes de enviar
      for (const file of data.evidencias) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`Solo se permiten imágenes. Archivo rechazado: ${file.name}`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} excede los 10MB`);
        }
      }

      // Crear FormData para enviar datos y archivos
      const formData = new FormData();
      
      // Agregar datos del formulario
      formData.append('tipo_documento', data.tipo_documento);
      formData.append('numero_documento', data.numero_documento);
      formData.append('sede', data.sede);
      formData.append('tipo_reporte', data.tipo_reporte);
      formData.append('lugar_incidente', data.lugar_incidente);
      formData.append('descripcion_observacion', data.descripcion_observacion);
      if (data.acciones_tomadas) {
        formData.append('acciones_tomadas', data.acciones_tomadas);
      }
      
      // Agregar archivos - el backend espera 'evidencias' como array
      data.evidencias.forEach((file) => {
        formData.append('evidencias', file);
      });

      // Log de depuración: listar entradas del FormData que se enviará al backend
      console.log('========================================');
      console.log('[Reporte] FormData final que se enviará al backend:');
      console.log('========================================');
      try {
        const debugEntries: any[] = [];
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            debugEntries.push({ 
              campo: key, 
              archivo: { 
                nombre: value.name, 
                tipo: value.type, 
                tamaño: `${(value.size / 1024).toFixed(2)} KB` 
              } 
            });
          } else {
            debugEntries.push({ campo: key, valor: value });
          }
        }
        console.table(debugEntries);
        console.log('========================================');
        console.log(`Total de campos: ${debugEntries.length}`);
        console.log(`Total de archivos: ${data.evidencias.length}`);
        console.log('========================================');
      } catch (e) {
        console.error('Error al leer FormData:', e);
      }

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

