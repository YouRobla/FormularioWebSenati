import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import senatiLogo from "@/assets/senati-logo.png";

interface Reporte {
  id: string;
  numero_registro: string;
  dni: string;
  nombres_apellidos: string;
  correo_institucional: string;
  tipo: string;
  fecha_incidente: string;
  estado: string;
  created_at: string;
  areas?: { nombre: string };
}

export default function Admin() {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadReportes();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Verify admin role
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (error || !roles) {
      toast.error("Acceso denegado");
      await supabase.auth.signOut();
      navigate("/auth");
    }
  };

  const loadReportes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reportes")
        .select(`
          *,
          areas:area_id (nombre)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReportes(data || []);
    } catch (error) {
      console.error("Error loading reportes:", error);
      toast.error("Error al cargar reportes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Sesión cerrada");
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "secondary";
      case "en proceso":
        return "default";
      case "resuelto":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={senatiLogo} alt="SENATI" className="h-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Panel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Sistema de Reportes - Zona Junín</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reportes Registrados
            </CardTitle>
            <CardDescription>
              Total de reportes: {reportes.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando reportes...</div>
            ) : reportes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay reportes registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Registro</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Nombres</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Incidente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportes.map((reporte) => (
                      <TableRow key={reporte.id}>
                        <TableCell className="font-medium">
                          {reporte.numero_registro}
                        </TableCell>
                        <TableCell>{reporte.dni}</TableCell>
                        <TableCell>{reporte.nombres_apellidos}</TableCell>
                        <TableCell>{reporte.areas?.nombre || "N/A"}</TableCell>
                        <TableCell>{reporte.tipo}</TableCell>
                        <TableCell>
                          {new Date(reporte.fecha_incidente).toLocaleDateString("es-PE")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(reporte.estado)}>
                            {reporte.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
