import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_REPORTE, CATEGORIAS_RELACIONADO } from "../report/constants";

interface DetalleReporteProps {
  form: any;
}

export function DetalleReporte({ form }: DetalleReporteProps) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Detalle del Reporte</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPOS_REPORTE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relacionado_a"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relacionado a *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIAS_RELACIONADO.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="ocurrio_en" render={({ field }) => (
          <FormItem>
            <FormLabel>Ocurrió en *</FormLabel>
            <FormControl><Input placeholder="Ubicación específica" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

      </div>

      <FormField control={form.control} name="observacion" render={({ field }) => (
        <FormItem>
          <FormLabel>Observación *</FormLabel>
          <FormControl><Textarea placeholder="Describa detalladamente el incidente..." className="min-h-[120px]" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}
