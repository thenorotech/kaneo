import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ESJ_PHASE_STATUS_OPTIONS,
  ESJ_PROJECT_STATUS_LABELS,
} from "@/constants/esj";
import useCreateEsjPhase from "@/hooks/mutations/esj/use-create-esj-phase";
import useDeleteEsjPhase from "@/hooks/mutations/esj/use-delete-esj-phase";
import useRenameEsjPhase from "@/hooks/mutations/esj/use-rename-esj-phase";
import useUpdateEsjPhaseStatus from "@/hooks/mutations/esj/use-update-esj-phase-status";
import useGetEsjProject from "@/hooks/queries/esj/use-get-esj-project";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { formatDateMedium } from "@/lib/format";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/esj/project/$projectId",
)({
  component: RouteComponent,
});

const selectClassName =
  "h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { workspaceId, projectId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetEsjProject(projectId);
  const { mutateAsync, isPending } = useUpdateEsjPhaseStatus(projectId);
  const { mutateAsync: createPhase, isPending: isCreating } =
    useCreateEsjPhase(projectId);
  const { mutateAsync: renamePhase, isPending: isRenaming } =
    useRenameEsjPhase(projectId);
  const { mutateAsync: deletePhase, isPending: isDeleting } =
    useDeleteEsjPhase(projectId);
  const { canManageTasks } = useWorkspacePermission();
  const canUpdate = canManageTasks();

  const [createOpen, setCreateOpen] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handlePhaseStatus = async (phaseId: string, value: string) => {
    try {
      await mutateAsync({
        phaseId,
        workspaceId,
        status: value as (typeof ESJ_PHASE_STATUS_OPTIONS)[number]["key"],
      });
      toast.success("Estado de la fase actualizado");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la fase",
      );
    }
  };

  const handleCreatePhase = async () => {
    const name = newPhaseName.trim();
    if (!name) return;
    try {
      await createPhase({ workspaceId, projectId, name });
      toast.success("Fase creada");
      setNewPhaseName("");
      setCreateOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear la fase",
      );
    }
  };

  const handleRenamePhase = async () => {
    if (!renameTarget) return;
    const name = renameTarget.name.trim();
    if (!name) return;
    try {
      await renamePhase({ phaseId: renameTarget.id, workspaceId, name });
      toast.success("Fase renombrada");
      setRenameTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo renombrar la fase",
      );
    }
  };

  const handleDeletePhase = async () => {
    if (!deleteTarget) return;
    try {
      await deletePhase({ phaseId: deleteTarget.id, workspaceId });
      toast.success("Fase eliminada");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar la fase",
      );
    }
  };

  const openPhaseBoard = (phaseId: string) =>
    navigate({
      to: "/dashboard/workspace/$workspaceId/esj/phase/$phaseId",
      params: { workspaceId, phaseId },
    });

  const backAction = (
    <Button
      variant="outline"
      size="xs"
      className="gap-1"
      onClick={() =>
        navigate({
          to: "/dashboard/workspace/$workspaceId/esj",
          params: { workspaceId },
        })
      }
    >
      <ArrowLeft className="w-3 h-3" />
      Volver
    </Button>
  );

  if (isLoading || !data) {
    return (
      <>
        <PageTitle title="Proyecto ESJ" />
        <WorkspaceLayout title="Proyecto ESJ" headerActions={backAction}>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </WorkspaceLayout>
      </>
    );
  }

  const { esjProject, areas, phases, pieces, totals } = data;

  const headerActions = (
    <>
      {backAction}
      <Button
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={() =>
          navigate({
            to: "/dashboard/workspace/$workspaceId/project/$projectId/board",
            params: { workspaceId, projectId },
          })
        }
      >
        <LayoutGrid className="w-3 h-3" />
        Abrir tablero
      </Button>
    </>
  );

  return (
    <>
      <PageTitle title={esjProject.name} />
      <WorkspaceLayout title={esjProject.name} headerActions={headerActions}>
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">{esjProject.name}</CardTitle>
              <Badge variant="outline">
                {ESJ_PROJECT_STATUS_LABELS[esjProject.status] ??
                  esjProject.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0 sm:grid-cols-3 lg:grid-cols-4">
              <Field label="Código SAP" value={esjProject.sapCode} mono />
              <Field label="Cliente" value={esjProject.clientName} />
              <Field label="Solicitante" value={esjProject.requester ?? "—"} />
              <Field
                label="Tipo de diseño"
                value={esjProject.designType ?? "—"}
              />
              <Field
                label="Fecha requerida"
                value={
                  esjProject.requiredDate
                    ? formatDateMedium(esjProject.requiredDate)
                    : "—"
                }
              />
              <Field
                label="Fecha conexión"
                value={
                  esjProject.connectionDate
                    ? formatDateMedium(esjProject.connectionDate)
                    : "—"
                }
              />
              <Field
                label="Fecha submittal"
                value={
                  esjProject.submittalDate
                    ? formatDateMedium(esjProject.submittalDate)
                    : "—"
                }
              />
              <Field label="Prioridad" value={esjProject.priority} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Metric
              label="Tonelaje total"
              value={`${totals.tonnage.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} t`}
            />
            <Metric
              label="Horas registradas"
              value={`${totals.loggedHours} h`}
            />
            <Metric
              label="Horas / tonelada"
              value={totals.hoursPerTon != null ? `${totals.hoursPerTon}` : "—"}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Fases ({phases.length})
              </h3>
              {canUpdate && (
                <Button
                  variant="outline"
                  size="xs"
                  className="gap-1"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  Agregar fase
                </Button>
              )}
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              Cada fase es una división de trabajo en paralelo con su propio
              tablero de tickets.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground font-medium">
                    #
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Fase
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Tickets
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Horas
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    h/ton
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Estado
                  </TableHead>
                  <TableHead className="text-foreground font-medium text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phases.map((phase, index) => (
                  <TableRow key={phase.id}>
                    <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3 text-sm font-medium">
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => openPhaseBoard(phase.id)}
                      >
                        {phase.name}
                      </button>
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">
                      {phase.ticketCount}
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">
                      {phase.loggedHours}
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">
                      {phase.hoursPerTon != null ? phase.hoursPerTon : "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <select
                        value={phase.status}
                        disabled={isPending || !canUpdate}
                        onChange={(e) =>
                          handlePhaseStatus(phase.id, e.target.value)
                        }
                        className={selectClassName}
                        aria-label={`Estado de ${phase.name}`}
                      >
                        {ESJ_PHASE_STATUS_OPTIONS.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="gap-1"
                          onClick={() => openPhaseBoard(phase.id)}
                        >
                          <LayoutGrid className="h-3 w-3" />
                          Tablero
                        </Button>
                        {canUpdate && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Renombrar ${phase.name}`}
                              onClick={() =>
                                setRenameTarget({
                                  id: phase.id,
                                  name: phase.name,
                                })
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Eliminar ${phase.name}`}
                              onClick={() =>
                                setDeleteTarget({
                                  id: phase.id,
                                  name: phase.name,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Áreas ({areas.length})
              </h3>
              <Card>
                <CardContent className="p-4">
                  {areas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin áreas.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {areas.map((area) => (
                        <li
                          key={area.id}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <span>{area.name}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {Number(area.tonnage ?? 0).toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            t
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Piezas ({pieces.length})
              </h3>
              <Card>
                <CardContent className="p-4">
                  {pieces.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin piezas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {pieces.map((piece) => (
                        <Badge
                          key={piece.id}
                          variant="secondary"
                          className="font-mono"
                        >
                          {piece.code}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setNewPhaseName("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva fase</DialogTitle>
              <DialogDescription>
                Una fase agrupa los tickets de un equipo o frente de trabajo.
              </DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              placeholder="Nombre de la fase (ej. Edificio Norte)"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreatePhase();
              }}
            />
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isCreating || !newPhaseName.trim()}
                onClick={handleCreatePhase}
              >
                Crear fase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={renameTarget != null}
          onOpenChange={(open) => {
            if (!open) setRenameTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renombrar fase</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={renameTarget?.name ?? ""}
              onChange={(e) =>
                setRenameTarget((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenamePhase();
              }}
            />
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRenameTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isRenaming || !renameTarget?.name.trim()}
                onClick={handleRenamePhase}
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteTarget != null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Eliminar la fase "{deleteTarget?.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Solo se puede eliminar una fase sin tickets. Esta acción no se
                puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose disabled={isDeleting}>
                <Button variant="outline" size="sm" disabled={isDeleting}>
                  Cancelar
                </Button>
              </AlertDialogClose>
              <AlertDialogClose
                disabled={isDeleting}
                onClick={handleDeletePhase}
              >
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  Eliminar
                </Button>
              </AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </WorkspaceLayout>
    </>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}
