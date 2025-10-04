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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setHasPermission(false);
    setIsCameraLoading(false);
    setPreviewBlob(null);
    setPreviewFile(null);
    onOpenChange(false);
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraLoading(true);
    setHasPermission(false);
    setPreviewBlob(null);
    setPreviewFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);

        const handleLoaded = () => {
          setHasPermission(true);
          setIsCameraLoading(false);
        };

        videoRef.current.addEventListener('loadeddata', handleLoaded, { once: true });

        const timeout = setTimeout(() => {
          if (!hasPermission) {
            handleLoaded();
          }
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } catch (err: any) {
      console.error('Error switching camera:', err);
      toast.error('No se pudo cambiar la cámara. Usando la predeterminada.');
      // Fallback a user mode
      setFacingMode('user');
      startCameraWithMode('user');
    }
  };

  const startCameraWithMode = async (mode: 'user' | 'environment') => {
    try {
      if (!videoRef.current) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (!videoRef.current) {
        throw new Error('Elemento de video no disponible después de reintento');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);

      const handleLoaded = () => {
        setHasPermission(true);
        setIsCameraLoading(false);
      };

      videoRef.current.addEventListener('loadeddata', handleLoaded, { once: true });

      const timeout = setTimeout(() => {
        if (!hasPermission) {
          handleLoaded();
        }
      }, 3000);

      return () => clearTimeout(timeout);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Permiso denegado para acceder a la cámara.' 
        : err.message || 'No se pudo acceder a la cámara.';
      toast.error(errorMessage);
      closeCamera();
    }
  };

  useEffect(() => {
    if (open) {
      setIsCameraLoading(true);
      setHasPermission(false);
      setPreviewBlob(null);
      setPreviewFile(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      requestAnimationFrame(() => startCameraWithMode(facingMode));
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [open, facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || files.length >= MAX_FILES) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('La cámara no está lista para capturar. Intenta de nuevo.');
      return;
    }

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
        setPreviewBlob(blob);
        setPreviewFile(file);
        previewUrlRef.current = URL.createObjectURL(blob);
        toast.success('Foto capturada. Revisa la vista previa.');
      }
    }, 'image/jpeg', 0.8);
  };

  const confirmPhoto = () => {
    if (previewFile) {
      onPhotoCaptured(previewFile);
      setPreviewBlob(null);
      setPreviewFile(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      toast.success('Foto guardada exitosamente');
      if (files.length + 1 >= MAX_FILES) {
        closeCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPreviewBlob(null);
    setPreviewFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
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
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4 overflow-auto">
          {isCameraLoading && <p className="text-lg">Cargando cámara...</p>}
          {!isCameraLoading && !hasPermission && (
            <p className="text-lg text-center">
              Solicitando permiso para la cámara...
              <br />
              <span className="text-sm text-muted-foreground">Por favor, permite el acceso.</span>
            </p>
          )}
          
          <video 
            ref={videoRef} 
            className={cn(
              "w-full max-w-lg h-auto rounded-lg shadow-lg", 
              { 'hidden': !hasPermission || isCameraLoading || !!previewBlob }
            )} 
            autoPlay 
            playsInline 
            muted 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {previewBlob && (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={previewUrlRef.current || ''} 
                alt="Vista previa de la foto" 
                className="w-full max-w-lg h-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground">Vista previa - ¿Usar esta foto?</p>
            </div>
          )}
          
          {hasPermission && !isCameraLoading && (
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
              {previewBlob ? (
                <>
                  <Button 
                    type="button" 
                    onClick={retakePhoto} 
                    className="w-full sm:w-auto" 
                    size="lg"
                  >
                    Volver a Tomar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={confirmPhoto} 
                    disabled={currentPhotosCount >= MAX_FILES} 
                    className="w-full sm:w-auto" 
                    size="lg"
                  >
                    Confirmar Foto
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    onClick={capturePhoto} 
                    disabled={currentPhotosCount >= MAX_FILES} 
                    className="w-full sm:w-auto" 
                    size="lg"
                  >
                    Tomar Foto
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={switchCamera} 
                    disabled={isCameraLoading}
                    className="w-full sm:w-auto" 
                    size="lg"
                  >
                    {facingMode === 'user' ? 'Cambiar a Trasera' : 'Cambiar a Frontal'}
                  </Button>
                </>
              )}
              <Button 
                type="button" 
                variant="destructive" 
                onClick={closeCamera} 
                className="w-full sm:w-auto" 
                size="lg"
              >
                Volver
              </Button>
            </div>
          )}
          
          {hasPermission && !previewBlob && (
            <p className="text-sm text-muted-foreground">
              Fotos tomadas: {currentPhotosCount}/{MAX_FILES} | Cámara: {facingMode === 'user' ? 'Frontal' : 'Trasera'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}