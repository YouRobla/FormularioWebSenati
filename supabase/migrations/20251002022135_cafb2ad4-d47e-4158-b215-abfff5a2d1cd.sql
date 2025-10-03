-- Create enum types for form options
CREATE TYPE public.tipo_reporte AS ENUM ('Acto Inseguro', 'Condición Insegura', 'Cuasi Accidente', 'Incidente', 'Accidente');
CREATE TYPE public.categoria_relacionado AS ENUM ('EPP', 'Maquinaria', 'Herramientas', 'Instalaciones', 'Procedimientos', 'Ergonomía', 'Otros');

-- Create areas/DZ table
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  zona TEXT DEFAULT 'Junín',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reportes table
CREATE TABLE public.reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_registro TEXT UNIQUE,
  dni TEXT NOT NULL,
  nombres_apellidos TEXT NOT NULL,
  correo_institucional TEXT NOT NULL,
  reportante TEXT NOT NULL,
  area_id UUID REFERENCES public.areas(id),
  tipo tipo_reporte NOT NULL,
  relacionado_a categoria_relacionado NOT NULL,
  ocurrio_en TEXT NOT NULL,
  fecha_incidente DATE NOT NULL,
  observacion TEXT NOT NULL,
  acciones_tomadas TEXT,
  evidencias JSONB DEFAULT '[]'::jsonb,
  estado TEXT DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to auto-generate numero_registro
CREATE OR REPLACE FUNCTION public.generate_numero_registro()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_registro := 'REP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('reportes_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for numero_registro
CREATE SEQUENCE IF NOT EXISTS reportes_seq START 1;

-- Trigger to auto-generate numero_registro
CREATE TRIGGER set_numero_registro
BEFORE INSERT ON public.reportes
FOR EACH ROW
WHEN (NEW.numero_registro IS NULL)
EXECUTE FUNCTION public.generate_numero_registro();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_reportes_updated_at
BEFORE UPDATE ON public.reportes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for areas (public read, admin write)
CREATE POLICY "Anyone can view active areas"
ON public.areas FOR SELECT
USING (activo = true);

CREATE POLICY "Only admins can insert areas"
ON public.areas FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update areas"
ON public.areas FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reportes (public insert, admin read all)
CREATE POLICY "Anyone can insert reportes"
ON public.reportes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all reportes"
ON public.reportes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reportes"
ON public.reportes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert initial areas for Zona Junín
INSERT INTO public.areas (nombre, descripcion, zona) VALUES
('CFP Junín', 'Centro de Formación Profesional Junín', 'Junín'),
('CFP Tarma', 'Centro de Formación Profesional Tarma', 'Junín'),
('CFP La Oroya', 'Centro de Formación Profesional La Oroya', 'Junín'),
('CFP Satipo', 'Centro de Formación Profesional Satipo', 'Junín'),
('Zonal Junín', 'Dirección Zonal Junín', 'Junín'),
('Administración', 'Área Administrativa', 'Junín'),
('Mantenimiento', 'Área de Mantenimiento', 'Junín'),
('Seguridad', 'Área de Seguridad y Salud', 'Junín');

-- Create storage bucket for evidencias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidencias', 'evidencias', false);

-- Storage policies for evidencias
CREATE POLICY "Anyone can upload evidencias"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidencias');

CREATE POLICY "Admins can view all evidencias"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidencias' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view their own evidencias temporarily"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidencias');