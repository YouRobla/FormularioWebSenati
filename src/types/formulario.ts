// Tipos simplificados - solo lo esencial
export interface DNIResponse {
  success: boolean;
  data?: {
    nombre_completo: string;
  };
  message?: string;
}
