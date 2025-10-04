import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MAX_FILES, MAX_PHOTO_SIZE } from "./constants";

interface CamaraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoCaptured: (file: File) => void;
  files: File[];
}

export function CamaraDialog({ open, onOpenChange, onPhotoCaptured, files }: CamaraDialogProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasPermission(false);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setIsCameraLoading(true);
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasPermission(true);
          }
        } catch (err: any) {
          console.error('Error accessing camera:', err);
          if (err.name === 'NotAllowedError') {
            toast.error('Permiso denegado para acceder a la cámara.');
          } else {
            toast.error('No se pudo acceder a la cámara.');
          }
          closeCamera();
        } finally {
          setIsCameraLoading(false);
        }
      };
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || files.length >= MAX_FILES) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (file.size > MAX_PHOTO_SIZE) {
          toast.error('La foto excede los 10MB');
          return;
        }
        onPhotoCaptured(file);
        toast.success('Foto capturada exitosamente');
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Cámara</DialogTitle>
          <DialogDescription>Toma hasta 3 fotos como evidencia (máximo 10MB por foto).</DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4 overflow-auto">
          {isCameraLoading && <p className="text-lg">Cargando cámara...</p>}
          {!isCameraLoading && !hasPermission && <p className="text-lg text-center">Solicitando permiso para la cámara...<br/><span className="text-sm text-muted-foreground">Por favor, permite el acceso.</span></p>}
          
          {hasPermission && (
            <>
              <video ref={videoRef} className={cn("w-full max-w-lg h-auto rounded-lg shadow-lg", { 'hidden': isCameraLoading })} autoPlay playsInline muted onCanPlay={() => setIsCameraLoading(false)} />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <Button type="button" onClick={capturePhoto} disabled={files.length >= MAX_FILES} className="flex-1" size="lg">Tomar Foto</Button>
                <Button type="button" variant="outline" onClick={closeCamera} className="flex-1" size="lg">Cancelar</Button>
              </div>
              <p className="text-sm text-muted-foreground">Fotos tomadas: {files.filter(f => f.type.startsWith('image/')).length}/{MAX_FILES}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}