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
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setupCamera = async (mode: 'user' | 'environment', isSwitchAttempt: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
        const handleLoaded = () => {
          setHasPermission(true);
          setIsLoading(false);
        };
        const onLoadedData = () => handleLoaded();
        videoRef.current.addEventListener('loadeddata', onLoadedData, { once: true });
        setTimeout(() => {
          if (!hasPermission) {
            handleLoaded();
            videoRef.current?.removeEventListener('loadeddata', onLoadedData);
          }
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setIsLoading(false);
      if (isSwitchAttempt && mode === 'environment') {
        toast.error('No se pudo cambiar la cámara. Usando la predeterminada.');
        setFacingMode('user');
      } else {
        const errorMessage = err.name === 'NotAllowedError'
          ? 'Permiso denegado para acceder a la cámara.'
          : err.message || 'No se pudo acceder a la cámara.';
        toast.error(errorMessage);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setPreviewUrl(null);
    setPreviewFile(null);
    setHasPermission(false);
    setIsLoading(false);
    onOpenChange(false);
  };

  const switchCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
  };

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (open) {
      setIsLoading(true);
      setHasPermission(false);
      setPreviewUrl(null);
      requestAnimationFrame(() => {
        setupCamera(facingMode, wasOpen);
      });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [open, facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || files.length >= MAX_FILES) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('La cámara no está lista para capturar. Intenta de nuevo.');
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
      setPreviewUrl(URL.createObjectURL(file));
      toast.success('Foto capturada. Revisa la vista previa.');
    }, 'image/jpeg', 0.8);
  };

  const confirmPhoto = () => {
    if (previewFile) {
      onPhotoCaptured(previewFile);
      setPreviewUrl(null);
      setPreviewFile(null);
      toast.success('Foto guardada exitosamente');
      if (files.length + 1 >= MAX_FILES) {
        closeCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  if (!open) return null;

  const currentPhotosCount = files.filter((f) => f.type.startsWith('image/')).length;

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
          {isLoading && <p className="text-lg">Cargando cámara...</p>}
          {!isLoading && !hasPermission && (
            <p className="text-lg text-center">
              Solicitando permiso para la cámara...
              <br />
              <span className="text-sm text-muted-foreground">Por favor, permite el acceso.</span>
            </p>
          )}
          <video
            ref={videoRef}
            className={cn("w-full max-w-lg h-auto rounded-lg shadow-lg", {
              hidden: !hasPermission || isLoading || !!previewFile,
            })}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          {previewFile && (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={previewUrl || ''}
                alt="Vista previa de la foto"
                className="w-full max-w-lg h-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground">Vista previa - ¿Usar esta foto?</p>
            </div>
          )}
          {hasPermission && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
              {previewFile ? (
                <>
                  <Button type="button" onClick={retakePhoto} className="w-full sm:w-auto" size="lg">
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
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    {facingMode === 'user' ? 'Cambiar a Trasera' : 'Cambiar a Frontal'}
                  </Button>
                </>
              )}
              <Button type="button" variant="destructive" onClick={closeCamera} className="w-full sm:w-auto" size="lg">
                Volver
              </Button>
            </div>
          )}
          {hasPermission && !isLoading && !previewFile && (
            <p className="text-sm text-muted-foreground">
              Fotos tomadas: {currentPhotosCount}/{MAX_FILES} | Cámara: {facingMode === 'user' ? 'Frontal' : 'Trasera'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
