import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MAX_FILES, MAX_PHOTO_SIZE } from "./constants";

interface CamaraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoCaptured: (file: File) => void;
  files: File[];
}

export function CamaraDialog({ open, onOpenChange, onPhotoCaptured, files }: CamaraDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Inicializar cámara
  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsLoading(false);
      }
    } catch (error: any) {
      // Error accessing camera
      setIsLoading(false);
      toast.error('No se pudo acceder a la cámara');
      onOpenChange(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setPreviewFile(null);
    onOpenChange(false);
  };

  // Manejar apertura/cierre del diálogo
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [open]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || files.length >= MAX_FILES) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('La cámara no está lista');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error('La foto excede los 10MB');
        return;
      }
      
      setPreviewFile(file);
      toast.success('Foto capturada');
    }, 'image/jpeg', 0.8);
  };

  const confirmPhoto = () => {
    if (previewFile) {
      onPhotoCaptured(previewFile);
      setPreviewFile(null);
      toast.success('Foto guardada');
      if (files.length + 1 >= MAX_FILES) {
        closeCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPreviewFile(null);
  };

  if (!open) return null;

  const currentPhotosCount = files.filter(f => f.type.startsWith('image/')).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Cámara</DialogTitle>
          <DialogDescription>
            Toma hasta {MAX_FILES} fotos como evidencia (máximo 10MB por foto).
            {currentPhotosCount > 0 && ` (${currentPhotosCount}/${MAX_FILES} tomadas)`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
          {isLoading && <p className="text-lg">Cargando cámara...</p>}
          
          <video
            ref={videoRef}
            className={`w-full max-w-lg h-auto rounded-lg shadow-lg ${isLoading || previewFile ? 'hidden' : ''}`}
            autoPlay
            playsInline
            muted
          />
          
          <canvas ref={canvasRef} className="hidden" />
          
          {previewFile && (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={URL.createObjectURL(previewFile)}
                alt="Vista previa"
                className="w-full max-w-lg h-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground">¿Usar esta foto?</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            {previewFile ? (
              <>
                <Button onClick={retakePhoto} className="w-full sm:w-auto" size="lg">
                  Volver a Tomar
                </Button>
                <Button
                  onClick={confirmPhoto}
                  disabled={currentPhotosCount >= MAX_FILES}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Confirmar Foto
                </Button>
              </>
            ) : (
              <Button
                onClick={capturePhoto}
                disabled={currentPhotosCount >= MAX_FILES || isLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                Tomar Foto
              </Button>
            )}
            <Button variant="destructive" onClick={closeCamera} className="w-full sm:w-auto" size="lg">
              Volver
            </Button>
          </div>
          
          {!isLoading && !previewFile && (
            <p className="text-sm text-muted-foreground">
              Fotos tomadas: {currentPhotosCount}/{MAX_FILES}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}