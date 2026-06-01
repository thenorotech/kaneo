import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ESJ_DEFAULT_TICKET_STAGE,
  ESJ_TICKET_STAGE_LABELS,
  ESJ_TICKET_STAGE_OPTIONS,
} from "@/constants/esj";
import useCreateEsjPhaseTicket from "@/hooks/mutations/esj/use-create-esj-phase-ticket";
import useUpdateEsjTicketStage from "@/hooks/mutations/esj/use-update-esj-ticket-stage";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import useGetEsjPhaseBoard from "@/hooks/queries/esj/use-get-esj-phase-board";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";
import type Task from "@/types/task";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/esj/phase/$phaseId",
)({
  component: RouteComponent,
});

const selectClassName =
  "h-7 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const PRIORITY_OPTIONS = [
  { value: "no-priority", label: "Sin prioridad" },
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

function RouteComponent() {
  const { workspaceId, phaseId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetEsjPhaseBoard(phaseId, workspaceId);
  const { canManageTasks } = useWorkspacePermission();
  const canManage = canManageTasks();
  const { mutate: updateTask } = useUpdateTask();

  const projectId = data?.board.id ?? "";
  const { mutateAsync: createTicket, isPending: isCreating } =
    useCreateEsjPhaseTicket(phaseId, projectId);
  const { mutateAsync: updateStage } = useUpdateEsjTicketStage(phaseId);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<string>(ESJ_DEFAULT_TICKET_STAGE);
  const [priority, setPriority] = useState("medium");

  const handleCreateTicket = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await createTicket({
        phaseId,
        workspaceId,
        title: trimmed,
        stage: stage as (typeof ESJ_TICKET_STAGE_OPTIONS)[number]["key"],
        priority,
      });
      toast.success("Ticket creado");
      setTitle("");
      setStage(ESJ_DEFAULT_TICKET_STAGE);
      setPriority("medium");
      setCreateOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el ticket",
      );
    }
  };

  const handleStageChange = async (taskId: string, value: string) => {
    try {
      await updateStage({
        taskId,
        workspaceId,
        stage: value as (typeof ESJ_TICKET_STAGE_OPTIONS)[number]["key"],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo cambiar la etapa",
      );
    }
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTask({ ...task, status: newStatus });
  };

  const backAction = (
    <Button
      variant="outline"
      size="xs"
      className="gap-1"
      onClick={() =>
        projectId
          ? navigate({
              to: "/dashboard/workspace/$workspaceId/esj/project/$projectId",
              params: { workspaceId, projectId },
            })
          : navigate({
              to: "/dashboard/workspace/$workspaceId/esj",
              params: { workspaceId },
            })
      }
    >
      <ArrowLeft className="h-3 w-3" />
      Volver
    </Button>
  );

  if (isLoading || !data) {
    return (
      <>
        <PageTitle title="Fase" />
        <WorkspaceLayout title="Fase" headerActions={backAction}>
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-72" />
            ))}
          </div>
        </WorkspaceLayout>
      </>
    );
  }

  const { phase, board } = data;
  const columns = board.columns ?? [];

  const headerActions = (
    <>
      {backAction}
      {canManage && (
        <Button
          size="xs"
          className="gap-1"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Nuevo ticket
        </Button>
      )}
    </>
  );

  return (
    <>
      <PageTitle title={phase.name} />
      <WorkspaceLayout title={phase.name} headerActions={headerActions}>
        <div className="flex h-full min-h-0 flex-col">
          <p className="mb-3 text-xs text-muted-foreground">
            Tablero de la fase. Las columnas son el estado del ticket; la etapa
            indica en qué parte del flujo de ingeniería va cada uno.
          </p>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex w-80 shrink-0 flex-col rounded-lg border border-border/60 bg-sidebar"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {column.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {column.tasks.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                  {column.tasks.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                      Sin tickets
                    </p>
                  ) : (
                    column.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border border-border bg-card p-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">
                            {task.title}
                          </p>
                          {task.priority && task.priority !== "no-priority" && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              {PRIORITY_OPTIONS.find(
                                (p) => p.value === task.priority,
                              )?.label ?? task.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {task.number != null && <span>#{task.number}</span>}
                          {task.assigneeName && <span>{task.assigneeName}</span>}
                        </div>
                        <div className="mt-2 flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Etapa
                          </label>
                          <select
                            value={task.stage ?? ESJ_DEFAULT_TICKET_STAGE}
                            disabled={!canManage}
                            onChange={(e) =>
                              handleStageChange(task.id, e.target.value)
                            }
                            className={selectClassName}
                            aria-label={`Etapa de ${task.title}`}
                          >
                            {ESJ_TICKET_STAGE_OPTIONS.map((option) => (
                              <option key={option.key} value={option.key}>
                                {ESJ_TICKET_STAGE_LABELS[option.key]}
                              </option>
                            ))}
                          </select>
                          <select
                            value={task.status}
                            disabled={!canManage}
                            onChange={(e) =>
                              handleStatusChange(
                                task as unknown as Task,
                                e.target.value,
                              )
                            }
                            className={selectClassName}
                            aria-label={`Estado de ${task.title}`}
                          >
                            {columns.map((col) => (
                              <option key={col.id} value={col.slug}>
                                {col.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setTitle("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo ticket en {phase.name}</DialogTitle>
              <DialogDescription>
                El ticket se crea en estado "To Do" dentro de esta fase.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Título</label>
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título del ticket"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTicket();
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Etapa</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ESJ_TICKET_STAGE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                disabled={isCreating || !title.trim()}
                onClick={handleCreateTicket}
              >
                Crear ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </WorkspaceLayout>
    </>
  );
}
