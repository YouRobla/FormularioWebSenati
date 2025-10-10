import { Upload, X, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ACCEPTED_TYPES } from "../report/constants";

interface GestionEvidenciasProps {
  form: any;
  files: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowCamera: (show: boolean) => void;
  removeFile: (index: number) => void;
}

export function GestionEvidencias({ 
  form, 
  files, 
  handleFileChange, 
  setShowCamera, 
  removeFile 
}: GestionEvidenciasProps) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primary">Evidencias</h2>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="files"
          render={() => (
            <FormItem>
              <label className="block text-sm font-medium mb-2">
                Subir fotos/evidencias (Máximo 3 archivos, 10MB c/u)
              </label>
              <div className="flex items-center justify-center w-full space-x-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex-1">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click para subir</span> o arrastre archivos
                    </p>
                    <p className="text-xs text-muted-foreground">Solo imágenes: JPG, PNG, GIF, WebP, BMP, HEIC (MAX. 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept={ACCEPTED_TYPES.join(",")} 
                    multiple 
                    onChange={handleFileChange} 
                    disabled={files.length >= 3} 
                  />
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setShowCamera(true)} 
                  disabled={files.length >= 3} 
                  className="flex flex-col items-center h-32 px-4"
                >
                  <Camera className="w-10 h-10 mb-2" />
                  <span className="text-sm">Tomar fotos</span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative border rounded-lg p-4 flex items-center gap-3">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
