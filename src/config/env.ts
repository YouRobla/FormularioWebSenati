// Configuración de variables de entorno
export const ENV_CONFIG = {
  DNI_API_TOKEN: import.meta.env.VITE_DNI_API_TOKEN || '',
  DNI_API_URL: import.meta.env.VITE_DNI_API_URL || 'https://api.factiliza.com/v1/dni/info',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
} as const;
