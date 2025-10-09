import { useState } from 'react';
import { toast } from 'sonner';
import { ENV_CONFIG } from '../config/env';

export function useDNIValidation() {
  const [isDNILoading, setIsDNILoading] = useState(false);
  const [isAPIFailed, setIsAPIFailed] = useState(false);

  const validateDNI = async (dni: string, setValue: (field: string, value: string) => void) => {
    setIsDNILoading(true);
    setIsAPIFailed(false);
    setValue("nombres_apellidos", "");

    try {
      const response = await fetch(`${ENV_CONFIG.DNI_API_URL}/${dni}`, {
        headers: {
          'Authorization': `Bearer ${ENV_CONFIG.DNI_API_TOKEN}`
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data?.nombre_completo) {
        setValue("nombres_apellidos", result.data.nombre_completo);
        setIsAPIFailed(false);
        toast.success("Datos encontrados");
      } else { 
        setIsAPIFailed(true);
        toast.error(result.message || "DNI no encontrado");
      }
    } catch (error) {
      setIsAPIFailed(true);
      toast.error("Error al consultar DNI. Puede ingresarlo manualmente.");
    } finally {
      setIsDNILoading(false);
    }
  };

  return {
    isDNILoading,
    isAPIFailed,
    validateDNI,
  };
}
