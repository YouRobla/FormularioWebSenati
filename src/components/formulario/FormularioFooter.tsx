import { Button } from "@/components/ui/button";

interface FormularioFooterProps {
  isLoading: boolean;
}

export function FormularioFooter({ isLoading }: FormularioFooterProps) {
  return (
    <>
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-lg font-bold text-primary">
          Soy consciente. Hagamos un SENATI, seguro y saludable *
        </p>
      </div>

      <div className="flex justify-center">
        <Button type="submit" size="lg" className="w-full md:w-auto px-12" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar Reporte"}
        </Button>
      </div>
    </>
  );
}
