import { Form } from "@/components/ui/form";
import { CamaraDialog } from "./report/CamaraDialog";
import { useFormularioReporte } from "./funcionalidades/useFormularioReporte";
import { DatosReportante } from "./formulario/DatosReportante";
import { DetalleReporte } from "./formulario/DetalleReporte";
import { GestionEvidencias } from "./formulario/GestionEvidencias";
import { FormularioFooter } from "./formulario/FormularioFooter";

export function FormularioReporte() {
  const {
    form,
    files,
    isLoading,
    showCamera,
    setShowCamera,
    mainDocumentType,
    setMainDocumentType,
    handlePhotoCaptured,
    handleFileChange,
    removeFile,
    onSubmit,
  } = useFormularioReporte();

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DatosReportante
            form={form}
            mainDocumentType={mainDocumentType}
            setMainDocumentType={setMainDocumentType}
          />

          <DetalleReporte form={form} />

          <GestionEvidencias
            form={form}
            files={files}
            handleFileChange={handleFileChange}
            setShowCamera={setShowCamera}
            removeFile={removeFile}
          />

          <FormularioFooter isLoading={isLoading} form={form} />
        </form>
      </Form>

      <CamaraDialog
        open={showCamera}
        onOpenChange={setShowCamera}
        onPhotoCaptured={handlePhotoCaptured}
        files={files}
      />
    </>
  );
}