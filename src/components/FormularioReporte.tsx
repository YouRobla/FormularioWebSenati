import { format } from "date-fns";
import { Upload, X, FileText, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CamaraDialog } from "./report/CamaraDialog";
import { useFormularioReporte } from "./funcionalidades/useFormularioReporte";
import { MAIN_DOCUMENT_TYPES, OTHER_DOCUMENT_TYPES, TIPOS_REPORTE, CATEGORIAS_RELACIONADO, AREAS, ACCEPTED_TYPES } from "./report/constants";
import { MainDocumentType } from "./report/constants";

export function FormularioReporte() {
  const {
    form,
    files,
    isLoading,
    isDNILoading,
    isAPIFailed,
    showCamera,
    setShowCamera,
    mainDocumentType,
    setMainDocumentType,
    handleDNIChange,
    handlePhotoCaptured,
    handleFileChange,
    removeFile,
    onSubmit,
  } = useFormularioReporte();

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Contenido de DatosReportante.tsx */}
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
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="reportante" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reportante *</FormLabel>
                    <FormControl><Input placeholder="Estudiante / Instructor / Administrativo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                )}
              />
            </div>
          </div>

          {/* Contenido de DetalleReporte.tsx */}
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
                )}
              />

              <FormField control={form.control} name="fecha_incidente" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y hora del incidente *</FormLabel>
                    <FormControl><Input type="text" value={format(field.value, "dd/MM/yyyy HH:mm:ss")} readOnly className="bg-muted" /></FormControl>
                    <FormDescription>Se registra automáticamente la fecha y hora actual</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="observacion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación *</FormLabel>
                  <FormControl><Textarea placeholder="Describa detalladamente el incidente..." className="min-h-[120px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contenido de GestionEvidencias.tsx */}
          <div className="bg-card rounded-lg border p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary">Evidencias</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <label className="block text-sm font-medium mb-2">
                      Subir fotos/evidencias (Máximo 3   archivos, 5MB c/u)
                    </label>
                    <div className="flex items-center justify-center w-full space-x-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex-1">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click para subir</span> o arrastre archivos
                          </p>
                          <p className="text-xs text-muted-foreground">JPG, PNG, GIF, BMP, HEIC, PDF (MAX. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept={ACCEPTED_TYPES.join(",")} multiple onChange={handleFileChange} disabled={files.length >= 3} />
                      </label>
                      <Button type="button" variant="outline" size="lg" onClick={() => setShowCamera(true)} disabled={files.length >= 3} className="flex flex-col items-center h-32 px-4">
                        <Camera className="w-10 h-10 mb-2" />
                        <span className="text-sm">Tomar fotos</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative border rounded-lg p-4 flex items-center gap-3">
                      {file.type.startsWith("image/") ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
        </form>
      </Form>

      <CamaraDialog
        open={showCamera}
        onOpenChange={setShowCamera}
        onPhotoCaptured={handlePhotoCaptured}
        files={files}
      />
    </>
  );
}