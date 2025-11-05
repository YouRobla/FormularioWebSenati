import { Button } from "@/components/ui/button";

interface FormularioFooterProps {
  isLoading: boolean;
  form: any;
}

export function FormularioFooter({ isLoading, form }: FormularioFooterProps) {
  // Verificar manualmente si todos los campos requeridos están completos
  const formValues = form.watch();
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  
  // Validar campos manualmente
  const isFormComplete = 
    formValues.documentType &&
    formValues.dni &&
    formValues.Sede &&
    formValues.tipo &&
    formValues.ocurrio_en &&
    formValues.observacion &&
    formValues.observacion.length >= 10 &&
    formValues.files &&
    formValues.files.length > 0 &&
    !hasErrors;
  
  const isDisabled = isLoading || !isFormComplete;
  
  return (
    <>
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-lg font-bold text-primary">
          Soy consciente. Hagamos un SENATI, seguro y saludable *
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full md:w-auto px-12" 
          disabled={isDisabled}
        >
          {isLoading ? "Enviando..." : "Enviar Reporte"}
        </Button>
      </div>
      
      {/* Debug: mostrar estado de validación */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
          <div>Completo: {isFormComplete ? '✓' : '✗'} | Loading: {isLoading ? '✓' : '✗'}</div>
          <div>Errores: {Object.keys(form.formState.errors).length}</div>
          <div className="text-[10px]">
            {!formValues.documentType && 'documentType '}
            {!formValues.dni && 'dni '}
            {!formValues.Sede && 'Sede '}
            {!formValues.tipo && 'tipo '}
            {!formValues.ocurrio_en && 'ocurrio_en '}
            {(!formValues.observacion || formValues.observacion.length < 10) && 'observacion '}
            {(!formValues.files || formValues.files.length === 0) && 'files '}
          </div>
        </div>
      )}
    </>
  );
}
