import * as z from "zod";
import { DOCUMENT_TYPES } from "../report/constants";

export const formSchema = z.object({
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