import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { DOCUMENT_TYPES, MainDocumentType, Area } from "./report/constants";
import { DatosReportante } from "./report/DatosReportante";
import { DetalleReporte } from "./report/DetalleReporte";
import { GestionEvidencias } from "./report/GestionEvidencias";
import { CamaraDialog } from "./report/CamaraDialog";

const formSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, {
    required_error: "Seleccione un tipo de documento",
  }),
  dni: z.string(),
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
  files: z.array(z.any()).min(1, "Debe subir al menos una evidencia."),
}).superRefine((data, ctx) => {
  if (data.documentType === "DNI") {
    if (!/^\d{8}$/.test(data.dni)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El DNI debe tener 8 dígitos numéricos",
        path: ["dni"],
      });
    }
  } else if (data.documentType && data.dni.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El número de documento es requerido",
      path: ["dni"],
    });
  }
});

export function FormularioReporte() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDNILoading, setIsDNILoading] = useState(false);
  const [isAPIFailed, setIsAPIFailed] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [mainDocumentType, setMainDocumentType] = useState<MainDocumentType>("DNI");

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
      files: [],
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
    // Reset documentType if main selection changes
    if (mainDocumentType === "DNI") {
      form.setValue("documentType", "DNI");
    } else {
      // Set to a default or clear it, so validation triggers
      form.setValue("documentType", "" as any); 
    }
  }, [mainDocumentType, form]);

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

  const handlePhotoCaptured = (file: File) => {
    const newFiles = [...files, file];
    setFiles(newFiles);
    form.setValue("files", newFiles, { shouldValidate: true });
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
      form.setValue("files", []);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error al enviar el reporte");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DatosReportante
            form={form}
            mainDocumentType={mainDocumentType}
            setMainDocumentType={setMainDocumentType}
            isDNILoading={isDNILoading}
            isAPIFailed={isAPIFailed}
            handleDNIChange={handleDNIChange}
          />

          <DetalleReporte form={form} />

          <GestionEvidencias
            form={form}
            files={files}
            setFiles={setFiles}
            onOpenCamera={() => setShowCamera(true)}
          />

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