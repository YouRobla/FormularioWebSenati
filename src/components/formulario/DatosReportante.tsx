import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { MAIN_DOCUMENT_TYPES, OTHER_DOCUMENT_TYPES } from "../report/constants";
import { MainDocumentType } from "../report/constants";

interface DatosReportanteProps {
  form: any;
  mainDocumentType: MainDocumentType;
  setMainDocumentType: (type: MainDocumentType) => void;
}

export function DatosReportante({ 
  form, 
  mainDocumentType, 
  setMainDocumentType, 
}: DatosReportanteProps) {
  const isDNI = form.watch("documentType") === "DNI";
  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Datos del Reportante</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {OTHER_DOCUMENT_TYPES.map((type) => (
                      <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={type} />
                        </FormControl>
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
            <FormLabel>{isDNI ? "Nº de DNI *" : "Nº de Documento *"}</FormLabel>
              <FormControl>
                <Input
                placeholder={isDNI ? "12345678" : "Número de documento"}
                maxLength={isDNI ? 8 : undefined}
                inputMode={isDNI ? "numeric" : "text"}
                pattern={isDNI ? "[0-9]*" : undefined}
                value={field.value}
                onChange={(e) => {
                  const value = isDNI ? e.target.value.replace(/\D/g, "") : e.target.value;
                  field.onChange(value);
                }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        
      </div>
    </div>
  );
}
