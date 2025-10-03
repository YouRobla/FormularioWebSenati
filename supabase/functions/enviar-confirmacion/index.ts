import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  nombreCompleto: string;
  numeroRegistro: string;
  tipo: string;
  fechaIncidente: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nombreCompleto, numeroRegistro, tipo, fechaIncidente }: EmailRequest = await req.json();

    console.log('Enviando email a:', email);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY no configurado");
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: "SENATI Seguridad <onboarding@resend.dev>",
        to: [email],
        subject: `Confirmación de Reporte ${numeroRegistro} - SENATI`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0, 51, 102, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #003366, #002244);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: bold;
                }
                .content {
                  padding: 30px 20px;
                }
                .info-box {
                  background-color: #f8f9fa;
                  border-left: 4px solid #FF6B35;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .info-box strong {
                  color: #003366;
                }
                .footer {
                  background-color: #f8f9fa;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #e0e0e0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛡️ SENATI - Sistema de Reportes</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px;">Zona Junín</p>
                </div>
                
                <div class="content">
                  <h2 style="color: #003366;">Reporte Registrado Exitosamente</h2>
                  
                  <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
                  
                  <p>Confirmamos que hemos recibido tu reporte de actos y condiciones inseguras. Tu compromiso con la seguridad en SENATI es invaluable.</p>
                  
                  <div class="info-box">
                    <p style="margin: 5px 0;"><strong>Número de Registro:</strong> ${numeroRegistro}</p>
                    <p style="margin: 5px 0;"><strong>Tipo de Reporte:</strong> ${tipo}</p>
                    <p style="margin: 5px 0;"><strong>Fecha del Incidente:</strong> ${fechaIncidente}</p>
                    <p style="margin: 5px 0;"><strong>Estado:</strong> Pendiente de Revisión</p>
                  </div>
                  
                  <p>Nuestro equipo de Seguridad y Salud Ocupacional revisará tu reporte y tomará las acciones correspondientes. Nos pondremos en contacto contigo si necesitamos información adicional.</p>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    <em>Recuerda: Tu reporte contribuye a crear un ambiente más seguro para todos en SENATI.</em>
                  </p>
                </div>
                
                <div class="footer">
                  <p><strong>SENATI - Servicio Nacional de Adiestramiento en Trabajo Industrial</strong></p>
                  <p>Dirección Zonal Junín</p>
                  <p style="margin-top: 10px;">Este es un correo automático, por favor no responder.</p>
                </div>
              </div>
            </body>
          </html>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Error de Resend:', errorData);
      throw new Error(`Error al enviar email: ${errorData}`);
    }

    const data = await emailResponse.json();
    console.log("Email enviado:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
