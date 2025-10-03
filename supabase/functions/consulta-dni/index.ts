import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DNIResponse {
  success: boolean;
  data?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
  };
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dni } = await req.json();

    if (!dni || dni.length !== 8) {
      return new Response(
        JSON.stringify({ success: false, message: 'DNI inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Nueva API key y endpoint Decolecta
    const API_KEY = 'sk_10704.k7dEJ63mxlJevBNdFsGJuukxviIxsOyJ';
    const apiUrl = `https://api.decolecta.com/v1/dni/${dni}`;

    const response = await fetch(apiUrl, {
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al consultar DNI');
    }

    const data = await response.json();

    if (data.success === false) {
      return new Response(
        JSON.stringify({ success: false, message: 'DNI no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ajusta estos campos según la respuesta real que te devuelva Decolecta
    const result: DNIResponse = {
      success: true,
      data: {
        nombres: data.nombres || '',
        apellidoPaterno: data.apellidoPaterno || '',
        apellidoMaterno: data.apellidoMaterno || '',
        nombreCompleto: `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim()
      }
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en consulta-dni:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
