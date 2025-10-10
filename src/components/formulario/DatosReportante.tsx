import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { MAIN_DOCUMENT_TYPES, OTHER_DOCUMENT_TYPES, AREAS, TIPOS_REPORTANTE } from "../report/constants";
import { MainDocumentType } from "../report/constants";

interface DatosReportanteProps {
  form: any;
  mainDocumentType: MainDocumentType;
  setMainDocumentType: (type: MainDocumentType) => void;
  handleDNIChange: (dni: string) => void;
  isDNILoading: boolean;
  isAPIFailed: boolean;
}

export function DatosReportante({ 
  form, 
  mainDocumentType, 
  setMainDocumentType, 
  handleDNIChange, 
  isDNILoading, 
  isAPIFailed 
}: DatosReportanteProps) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Datos del Reportante</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormItem>
            <FormLabel>Tipo de Documento *</FormLabel>
            <Select
              onValueChange={(value: MainDocumentType) => {
                setMainDocumentType(value);
                if (value === "DNI") {
                  form.setValue("documentType", "DNI");
                } else {
                  form.setValue("documentType", "" as any, { shouldValidate: false });
                }
              }}
              defaultValue={mainDocumentType}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MAIN_DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        </div>

        {mainDocumentType === "Otro tipo de documento" && (
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="space-y-3 md:col-span-2">
                <FormLabel>Especifique el tipo de documento *</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {OTHER_DOCUMENT_TYPES.map((type) => (
                      <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value={type} /></FormControl>
                        <FormLabel className="font-normal">{type}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.getValues("documentType") === "DNI" ? "DNI *" : "Nº de Documento *"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={form.getValues("documentType") === "DNI" ? "12345678" : "Número de documento"}
                  maxLength={form.getValues("documentType") === "DNI" ? 8 : undefined}
                  {...field}
                  onChange={(e) => {
                    const value = form.getValues("documentType") === "DNI" ? e.target.value.replace(/\D/g, "") : e.target.value;
                    field.onChange(value);
                    if (form.getValues("documentType") === "DNI" && value.length === 8) {
                      handleDNIChange(value);
                    }
                  }}
                  disabled={isDNILoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombres_apellidos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombres y Apellidos *</FormLabel>
              <FormControl>
                <Input {...field} disabled={form.getValues("documentType") === "DNI" && !isAPIFailed && !isDNILoading} />
              </FormControl>
              {form.getValues("documentType") === "DNI" && (
                <FormDescription>{isAPIFailed ? "Por favor, ingrese el nombre manualmente" : "Se completa automáticamente con el DNI"}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="correo_institucional" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Institucional *</FormLabel>
            <FormControl>
              <Input placeholder="000000@senati.pe" {...field} onChange={(e) => {
                const value = e.target.value;
                if (value.endsWith('@') && !value.endsWith('@senati.pe')) {
                  field.onChange(value + 'senati.pe');
                } else if (value.endsWith('@s')) {
                  field.onChange(value.slice(0, -1) + 'senati.pe');
                } else {
                  field.onChange(value);
                }
              }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reportante" render={({ field }) => (
          <FormItem>
            <FormLabel>Reportante *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo de reportante" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIPOS_REPORTANTE.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="area_id" render={({ field }) => (
          <FormItem>
            <FormLabel>DZ/Área *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Seleccione un área" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {AREAS.map((area) => (<SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  );
}
