export const DOCUMENT_TYPES = [
  "DNI",
  "Pasaporte",
  "Carné de extranjería",
  "Cédula de identidad",
  "Licencia de conducir",
  "Tarjeta consular",
  "NIE",
  "Visa",
  "Otro",
] as const;

export const OTHER_DOCUMENT_TYPES = DOCUMENT_TYPES.filter(
  (type) => type !== "DNI"
);

export const MAIN_DOCUMENT_TYPES = ["DNI", "Otro tipo de documento"] as const;

export type MainDocumentType = (typeof MAIN_DOCUMENT_TYPES)[number];

export const TIPOS_REPORTE = [
  "Acto Inseguro",
  "Condición Insegura",
  "Cuasi Accidente",
  "Incidente",
  "Accidente",
];

export const CATEGORIAS_RELACIONADO = [
  "EPP",
  "Maquinaria",
  "Herramientas",
  "Instalaciones",
  "Procedimientos",
  "Ergonomía",
  "Otros",
];

export const AREAS = [
  { id: "1", nombre: "Área de Seguridad" },
  { id: "2", nombre: "Área de Mantenimiento" },
  { id: "3", nombre: "Área de Producción" },
  { id: "4", nombre: "Área Administrativa" },
  { id: "5", nombre: "Área de Calidad" },
];

export const MAX_FILES = 3;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB para archivos subidos
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB para fotos de cámara
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/heic",
  "application/pdf",
];

export interface Area {
  id: string;
  nombre: string;
}