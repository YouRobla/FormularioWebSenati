// src/components/SafetyCard.tsx

import { HandMetal, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 

// Define las props para el componente
interface SafetyCardProps {
  // URL de la imagen del personal (el hombre con casco)
  personnelImageUrl: string;
  // URL del logo de la institución (SENATI)
  logoUrl: string;
}

export function SafetyCard({ personnelImageUrl, logoUrl }: SafetyCardProps) {
  return (
    // Se elimina el 'max-w-7xl mx-auto' para que sea de lado a lado
    <Card className="overflow-hidden shadow-2xl border-none rounded-none">
      <div className="flex flex-col md:flex-row bg-white">
        
        {/* Sección de la Imagen del Personal (1/3 del ancho en escritorio) */}
        <div className="md:w-1/3 flex-shrink-0 bg-gray-200">
          <img
            src={personnelImageUrl}
            alt="Personal de seguridad industrial"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Sección del Mensaje Institucional y Títulos (2/3 del ancho en escritorio) */}
        <div className="md:w-2/3 bg-blue-800 text-white p-6 md:p-10 flex flex-col justify-between relative">
          
          {/* Diseño con patrón geométrico sutil */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="blue-pattern-safe" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 0 0 L 25 25 M 25 0 L 0 25" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blue-pattern-safe)" />
            </svg>
          </div>

          <CardHeader className="p-0 mb-4 z-10 space-y-2">
            
            <div className="flex justify-between items-start mb-6">
                 {/* Nuevo Título Principal del Formulario */}
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Formulario de Reporte de Actos y Condiciones Inseguras
                    </h1>
                    <p className="text-sm md:text-base opacity-90 mt-1">DIRECCIÓN ZONAL JUNIN - PASCO - HUANCAVELICA</p>
                </div>

                {/* Logo y Botón de Admin 
                <div className="flex flex-col items-end gap-3">
                    <img src={logoUrl} alt="Logo de SENATI" className="h-20 object-contain filter brightness-[1.5]" />
                    <Link to="/auth">
                        
                    </Link>
                </div> */}
            </div>
            
            {/* Título de Seguridad (el mensaje del cartel) */}
            <CardTitle className="text-xl md:text-2xl font-semibold flex items-center pt-4 border-t border-white/30">
                <HandMetal className="w-6 h-6 mr-2 text-yellow-300" />
                ¡La seguridad depende de todos!
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 z-10">
            <p className="text-3xl md:text-5xl font-black leading-tight tracking-tighter">
              REPORTA LOS ACTOS Y CONDICIONES INSEGURAS EN NUESTRAS SEDES
            </p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}