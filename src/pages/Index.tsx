import { Shield } from "lucide-react";

// 1. Importación Corregida y Única
import { SafetyCard } from "@/components/SafetyCard"; 
import { FormularioReporte } from "@/components/FormularioReporte";

// 2. Importaciones de Imágenes
import senatiLogo from "@/assets/senati-logo.png";
import personnelImage from "@/assets/imagen-de-personal.jpg";
import senatiLogo1 from '../assets/logo.jpg';


const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      
      {/* Nuevo Header / Banner de Seguridad (Ocupa toda la pantalla de lado a lado) */}
      <section className="bg-white shadow-xl">
        {/* El SafetyCard ahora maneja todo el contenido del header */}
        <SafetyCard 
          personnelImageUrl={personnelImage}
          logoUrl={senatiLogo}
        />
      </section>

      {/* Subtitle / Barra de Información */}
      <div className="bg-secondary/10 border-b">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm md:text-base text-muted-foreground">
            <Shield className="inline h-4 w-4 mr-2" />
            Completa todos los campos obligatorios (*) para registrar tu reporte
          </p>
        </div>
      </div>

      {/* Main Content: Formulario */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* El Formulario Reporte */}
          <FormularioReporte />
        </div>
      </main>

                  
         {/* Footer */}
    <footer className="bg-[#003087] text-white py-8 mt-8 shadow-xl">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col items-center justify-center text-center space-y-4">
      
        <div className="space-y-3">
          <p className="font-bold text-3xl tracking-tight">SENATI</p>
          <p className="text-lg font-medium">
            Servicio Nacional de Adiestramiento en Trabajo Industrial
          </p>
          <div className="h-px w-24 bg-[#1E90FF] mx-auto"></div>
          <p className="text-sm opacity-80">
            Dirección Zonal Junín - Pasco - Huancavelica
          </p>
          <p className="text-xs opacity-70">
            © {new Date().getFullYear()} SENATI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>



    </div>
  );
};

export default Index;