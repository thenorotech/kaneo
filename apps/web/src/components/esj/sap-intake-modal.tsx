import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ESJ_SAMPLE_SAP_EMAIL } from "@/constants/esj";
import useIntakeEsjProject from "@/hooks/mutations/esj/use-intake-esj-project";
import { toast } from "@/lib/toast";

type SapIntakeModalProps = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
};

function SapIntakeModal({ open, onClose, workspaceId }: SapIntakeModalProps) {
  const [email, setEmail] = useState("");
  const { mutateAsync, isPending } = useIntakeEsjProject();
  const navigate = useNavigate();

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const result = await mutateAsync({ workspaceId, email });
      toast.success("Proyecto ESJ creado desde SAP", {
        description: `${result.phases.length} fase(s) y ${result.piecesCreated} pieza(s). Complejidad: ${result.routing.complexity}.`,
      });
      handleClose();
      navigate({
        to: "/dashboard/workspace/$workspaceId/esj/project/$projectId",
        params: { workspaceId, projectId: result.project.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo crear el proyecto ESJ",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar proyecto desde SAP</DialogTitle>
          <DialogDescription>
            Pega el correo automático de SAP (acción zsd_email_cotizacion). En
            producción esto lo dispara el BAPI de SAP contra este mismo
            endpoint.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Codigo SAP: ...&#10;Nombre Proyecto: ...&#10;Cliente: ..."
            className="font-mono text-xs [&_[data-slot=textarea]]:min-h-[260px]"
            autoFocus
          />

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEmail(ESJ_SAMPLE_SAP_EMAIL)}
            >
              <FlaskConical className="h-4 w-4" />
              Cargar ejemplo SAP (test)
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5"
                loading={isPending}
                disabled={!email.trim()}
              >
                <Zap className="h-4 w-4" />
                Crear proyecto
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SapIntakeModal;
