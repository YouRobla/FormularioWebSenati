import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { MainDocumentType, MAX_FILES, MAX_FILE_SIZE, ACCEPTED_TYPES } from "../report/constants";
import { formSchema } from "./schema";

// Simula una llamada a una API con un retraso
const fakeApiCall = (data: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Datos del formulario listos para enviar al backend:", data);
      resolve({ success: true, numero_registro: Math.floor(Math.random() * 100000) });
    }, 1500);
  });
};

export function useFormularioReporte() {
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
    form.setValue("dni", "");
    form.setValue("nombres_apellidos", "");
    setIsAPIFailed(false);
    if (mainDocumentType === "DNI") {
      form.setValue("documentType", "DNI");
    } else {
      form.setValue("documentType", "" as any);
    }
  }, [mainDocumentType, form]);

  useEffect(() => {
    const interval = setInterval(() => {
      form.setValue("fecha_incidente", new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [form]);

  const handleDNIChange = async (dni: string) => {
    if (documentType !== "DNI" || dni.length !== 8) return;

    setIsDNILoading(true);
    setIsAPIFailed(false);
    form.setValue("nombres_apellidos", "");

    try {
      const response = await fetch(`https://api.factiliza.com/v1/dni/info/${dni}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTYwOSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.smkBTgVIHHGPRSF9kCqRANNFMo42rXPbjpY-t2_02_U'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data && result.data.nombre_completo) {
        form.setValue("nombres_apellidos", result.data.nombre_completo);
        setIsAPIFailed(false);
        toast.success("Datos encontrados");
      } else {
        setIsAPIFailed(true);
        toast.error(result.message || "DNI no encontrado o respuesta inesperada.");
      }
    } catch (error) {
      console.error("Error consultando DNI:", error);
      setIsAPIFailed(true);
      toast.error("Error al consultar DNI. Puede ingresarlo manualmente.");
    } finally {
      setIsDNILoading(false);
    }
  };

  const handlePhotoCaptured = (file: File) => {
    const newFiles = [...files, file];
    setFiles(newFiles);
    form.setValue("files", newFiles, { shouldValidate: true });
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

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    form.setValue("files", newFiles, { shouldValidate: true });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    form.setValue("files", newFiles, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Aquí es donde enviarías los datos a tu backend de Node.js.
      // Por ahora, simulamos el proceso y lo mostramos en la consola.
      const dataToSend = {
        ...values,
        files: files.map(file => ({ // Preparamos la info de archivos
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };

      const response: any = await fakeApiCall(dataToSend);

      toast.success(`¡Reporte simulado enviado! Número: ${response.numero_registro}`, { duration: 10000 });
      
      form.reset();
      setFiles([]);
      form.setValue("files", []);

    } catch (error: any) {
      console.error("Error en la simulación de envío:", error);
      toast.error(error.message || "Error al simular el envío del reporte");
    } finally {
      setIsLoading(false);
    }
  }

  return {
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
  };
}
