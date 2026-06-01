import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart3, Factory, Inbox, Upload, Users } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import SapIntakeModal from "@/components/esj/sap-intake-modal";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESJ_PROJECT_STATUS_LABELS } from "@/constants/esj";
import useGetEsjProjects from "@/hooks/queries/esj/use-get-esj-projects";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { formatDateMedium } from "@/lib/format";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/esj/",
)({
  component: RouteComponent,
});

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "asignado", label: "Asignado" },
  { value: "aceptado", label: "Aceptado" },
  { value: "en-progreso", label: "En progreso" },
  { value: "submittal", label: "Submittal" },
  { value: "cerrado", label: "Cerrado" },
];

function statusVariant(status: string) {
  if (status === "cerrado") return "default" as const;
  if (status === "rechazado") return "destructive" as const;
  if (status === "pendiente") return "secondary" as const;
  return "outline" as const;
}

const selectClassName =
  "h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const { canCreateProjects } = useWorkspacePermission();
  const canCreate = canCreateProjects();

  const { data: projects, isLoading } = useGetEsjProjects({
    workspaceId,
    status: status || undefined,
  });

  const headerActions = (
    <>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={selectClassName}
        aria-label="Filtrar por estado"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={() =>
          navigate({
            to: "/dashboard/workspace/$workspaceId/esj/roles",
            params: { workspaceId },
          })
        }
      >
        <Users className="w-3 h-3" />
        Roles
      </Button>
      <Button
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={() =>
          navigate({
            to: "/dashboard/workspace/$workspaceId/esj/metrics",
            params: { workspaceId },
          })
        }
      >
        <BarChart3 className="w-3 h-3" />
        Métricas
      </Button>
      {canCreate ? (
        <Button
          variant="outline"
          size="xs"
          className="gap-1"
          onClick={() => setIsIntakeOpen(true)}
        >
          <Upload className="w-3 h-3" />
          Importar de SAP
        </Button>
      ) : null}
    </>
  );

  return (
    <>
      <PageTitle title="Proyectos ESJ" />
      <WorkspaceLayout
        title="Proyectos ESJ (Acero estructural)"
        headerActions={headerActions}
      >
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  Proyecto
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Código SAP
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Cliente
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Toneladas
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Requerido
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <TableCell key={j} className="py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !projects || projects.length === 0 ? (
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Factory />
              </EmptyMedia>
              <EmptyTitle>Sin proyectos ESJ todavía</EmptyTitle>
              <EmptyDescription>
                Importa el correo automático de SAP para crear el primer
                proyecto de acero estructural y empezar a medir tiempos por
                fase.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {canCreate && (
                <Button
                  onClick={() => setIsIntakeOpen(true)}
                  className="gap-1.5"
                >
                  <Inbox className="w-4 h-4" />
                  Importar de SAP
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  Proyecto
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Código SAP
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Cliente
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Toneladas
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Requerido
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/dashboard/workspace/$workspaceId/esj/project/$projectId",
                      params: { workspaceId, projectId: project.projectId },
                    })
                  }
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                      {project.designType ? (
                        <span className="text-xs text-muted-foreground">
                          {project.designType}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                    {project.sapCode}
                  </TableCell>
                  <TableCell className="py-3 text-sm">
                    {project.clientName}
                  </TableCell>
                  <TableCell className="py-3 text-sm tabular-nums">
                    {Number(project.totalTonnage ?? 0).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    t
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {project.requiredDate
                      ? formatDateMedium(project.requiredDate)
                      : "—"}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant={statusVariant(project.status)}>
                      {ESJ_PROJECT_STATUS_LABELS[project.status] ??
                        project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </WorkspaceLayout>

      <SapIntakeModal
        open={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        workspaceId={workspaceId}
      />
    </>
  );
}
