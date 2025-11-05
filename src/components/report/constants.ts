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
  "Acto Subestándar",
  "Condición Subestándar",
  "Accidente",
  "Incidente"
];

export const SEDES = [
  "CFP HUANCAYO",
  "CFP LA OROYA",
  "CFP CERRO DE PASCO",
  "CFP SAN RAMON",
  "CFP RIO NEGRO",
  "CFP HUANCAVELICA",
];

export const MAX_FILES = 3;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB para archivos (solo imágenes)
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB para fotos de cámara
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/heic",
  "image/heif",
]; // Solo imágenes, sin PDFs

