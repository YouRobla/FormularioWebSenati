import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  documentType: z.enum(["DNI", "Otro documento"], {
    required_error: "Seleccione un tipo de documento",
  }),
  dni: z.string().refine(
    (value, ctx) => {
      if (ctx.parent.documentType === "DNI") {
        return value.length === 8 && /^\d{8}$/.test(value);
      }
      return value.length > 0;
    },
    (value, ctx) => ({
      message:
        ctx.parent.documentType === "DNI"
          ? "El DNI debe tener 8 dígitos numéricos"
          : "El documento es requerido",
    })
  ),
  nombres_apellidos: z.string().min(1, "Campo requerido"),
  correo_institucional: z
    .string()
    .email("Email inválido")
    .endsWith("@senati.pe", "Debe ser un correo @senati.pe"),
  reportante: z.string().min(1, "Campo requerido"),
  area_id: z.string().min(1, "Seleccione un área"),
  tipo: z.string().min(1, "Seleccione un tipo"),
  relacionado_a: z.string().min(1, "Seleccione una categoría"),
  ocurrio_en: z.string().min(1, "Campo requerido"),
  fecha_incidente: z.date({ required_error: "La fecha y hora son requeridas" }),
  observacion: z.string().min(10, "Mínimo 10 caracteres"),
});

interface Area {
  id: string;
  nombre: string;
}

const TIPOS_REPORTE = [
  "Acto Inseguro",
  "Condición Insegura",
  "Cuasi Accidente",
  "Incidente",
  "Accidente",
];

const CATEGORIAS_RELACIONADO = [
  "EPP",
  "Maquinaria",
  "Herramientas",
  "Instalaciones",
  "Procedimientos",
  "Ergonomía",
  "Otros",
];

const AREAS = [
  { id: "1", nombre: "Área de Seguridad" },
  { id: "2", nombre: "Área de Mantenimiento" },
  { id: "3", nombre: "Área de Producción" },
  { id: "4", nombre: "Área Administrativa" },
  { id: "5", nombre: "Área de Calidad" },
];

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/heic",
  "application/pdf",
];

export function FormularioReporte() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDNILoading, setIsDNILoading] = useState(false);
  const [isAPIFailed, setIsAPIFailed] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "DNI",
      dni: "",
      nombres_apellidos: "",
      correo_institucional: "",
      reportante: "",
      area_id: "",
      tipo: "",
      relacionado_a: "",
      ocurrio_en: "",
      fecha_incidente: new Date(),
      observacion: "",
    },
  });

  const documentType = form.watch("documentType");

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    form.setValue("dni", "");
    form.setValue("nombres_apellidos", "");
    setIsAPIFailed(false);
  }, [documentType, form]);

  // Update fecha_incidente every second
  useEffect(() => {
    const interval = setInterval(() => {
      form.setValue("fecha_incidente", new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [form]);

  const loadAreas = async () => {
    const { data, error } = await supabase.from("areas").select("id, nombre").eq("activo", true);

    if (error) {
      console.error("Error loading areas:", error);
      toast.error("Error al cargar las áreas");
      return;
    }

    setAreas(data || []);
  };

  const handleDNIChange = async (dni: string) => {
    if (documentType !== "DNI" || dni.length !== 8) return;

    setIsDNILoading(true);
    try {
      const response = await supabase.functions.invoke("consulta-dni", {
        body: { dni },
      });

      if (response.error) throw response.error;

      if (response.data?.success && response.data?.data) {
        form.setValue("nombres_apellidos", response.data.data.nombreCompleto);
        setIsAPIFailed(false);
        toast.success("Datos encontrados");
      } else {
        setIsAPIFailed(true);
        toast.error(response.data?.message || "DNI no encontrado");
      }
    } catch (error) {
      console.error("Error consultando DNI:", error);
      setIsAPIFailed(true);
      toast.error("Error al consultar DNI");
    } finally {
      setIsDNILoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido: ${file.name}`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`El archivo ${file.name} excede los 5MB`);
        return;
      }
    }

    setFiles([...files, ...selectedFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const uploadedFiles: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${values.dni}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("evidencias")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          throw new Error(`Error al subir ${file.name}`);
        }

        uploadedFiles.push(filePath);
      }

      const { data: reporteData, error: reporteError } = await supabase
        .from("reportes")
        .insert({
          dni: values.dni,
          nombres_apellidos: values.nombres_apellidos,
          correo_institucional: values.correo_institucional,
          reportante: values.reportante,
          area_id: values.area_id,
          tipo: values.tipo,
          relacionado_a: values.relacionado_a,
          ocurrio_en: values.ocurrio_en,
          fecha_incidente: format(new Date(), "yyyy-MM-dd HH:mm:ss"), // Use current timestamp
          observacion: values.observacion,
          evidencias: uploadedFiles as any,
        })
        .select("numero_registro")
        .single();

      if (reporteError) throw reporteError;

      await supabase.functions.invoke("enviar-confirmacion", {
        body: {
          email: values.correo_institucional,
          nombreCompleto: values.nombres_apellidos,
          numeroRegistro: reporteData.numero_registro,
          tipo: values.tipo,
          fechaIncidente: format(new Date(), "dd/MM/yyyy HH:mm:ss"), // Use current timestamp
        },
      });

      toast.success(`¡Reporte enviado! Número: ${reporteData.numero_registro}`, {
        duration: 10000,
      });

      form.reset();
      setFiles([]);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error al enviar el reporte");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h2 className="text-2xl font-bold text-primary">Datos del Reportante</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="Otro documento">Otro documento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.getValues("documentType") === "DNI" ? "DNI *" : "Documento *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={form.getValues("documentType") === "DNI" ? "12345678" : "Número de documento"}
                      maxLength={form.getValues("documentType") === "DNI" ? 8 : undefined}
                      {...field}
                      onChange={(e) => {
                        const value =
                          form.getValues("documentType") === "DNI"
                            ? e.target.value.replace(/\D/g, "")
                            : e.target.value;
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
                    <Input
                      {...field}
                      disabled={
                        form.getValues("documentType") === "DNI" && !isAPIFailed && !isDNILoading
                      }
                    />
                  </FormControl>
                  {form.getValues("documentType") === "DNI" && (
                    <FormDescription>
                      {isAPIFailed
                        ? "Por favor, ingrese el nombre manualmente"
                        : "Se completa automáticamente con el DNI"}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="correo_institucional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Institucional *</FormLabel>
                  <FormControl>
                    <Input placeholder="000000@senati.pe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reportante *</FormLabel>
                  <FormControl>
                    <Input placeholder="Estudiante / Instructor / Administrativo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DZ/Área *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AREAS.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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

            <FormField
              control={form.control}
              name="ocurrio_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocurrió en *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicación específica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_incidente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y hora del incidente *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={format(field.value, "dd/MM/yyyy HH:mm:ss")}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>Se registra automáticamente la fecha y hora actual</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observación *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa detalladamente el incidente..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h2 className="text-2xl font-bold text-primary">Evidencias</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Subir fotos/evidencias (Máximo 3 archivos, 5MB c/u)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click para subir</span> o arrastre archivos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF, BMP, HEIC, PDF (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_TYPES.join(",")}
                    multiple
                    onChange={handleFileChange}
                    disabled={files.length >= MAX_FILES}
                  />
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative border rounded-lg p-4 flex items-center gap-3">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
  );
}