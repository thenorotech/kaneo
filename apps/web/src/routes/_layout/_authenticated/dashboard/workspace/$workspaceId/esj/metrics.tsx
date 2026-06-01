import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGetEsjMetrics from "@/hooks/queries/esj/use-get-esj-metrics";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/esj/metrics",
)({
  component: RouteComponent,
});

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
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const [onlyClosed, setOnlyClosed] = useState(false);
  const { data, isLoading } = useGetEsjMetrics({
    workspaceId,
    onlyClosed: onlyClosed ? "true" : undefined,
  });

  const headerActions = (
    <>
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
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={onlyClosed}
          onChange={(e) => setOnlyClosed(e.target.checked)}
        />
        Solo proyectos cerrados
      </label>
    </>
  );

  return (
    <>
      <PageTitle title="Métricas de cotización ESJ" />
      <WorkspaceLayout
        title="Métricas horas / tonelada"
        headerActions={headerActions}
      >
        {isLoading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Basado en {data.projectCount} proyecto(s). Usa estas tasas para
              estimar las horas (y el costo) de proyectos futuros según tonelaje y
              tipo de diseño.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric
                label="Horas registradas"
                value={`${data.totals.hours} h`}
              />
              <Metric
                label="Tonelaje acumulado"
                value={`${data.totals.tonnage.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} t`}
              />
              <Metric
                label="Horas / tonelada (global)"
                value={
                  data.totals.hoursPerTon != null
                    ? `${data.totals.hoursPerTon}`
                    : "—"
                }
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Por fase
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground font-medium">Fase</TableHead>
                    <TableHead className="text-foreground font-medium">Proyectos</TableHead>
                    <TableHead className="text-foreground font-medium">Horas</TableHead>
                    <TableHead className="text-foreground font-medium">Toneladas</TableHead>
                    <TableHead className="text-foreground font-medium">h/ton</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byPhase.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        Aún no hay tiempo registrado. Ficha horas en las tareas de
                        cada fase para alimentar la métrica.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.byPhase.map((phase) => (
                      <TableRow key={phase.phaseSlug}>
                        <TableCell className="py-3 text-sm font-medium">
                          {phase.phaseName}
                        </TableCell>
                        <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">
                          {phase.projectCount}
                        </TableCell>
                        <TableCell className="py-3 text-sm tabular-nums">
                          {phase.hours}
                        </TableCell>
                        <TableCell className="py-3 text-sm tabular-nums">
                          {phase.tonnage}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-semibold tabular-nums">
                          {phase.hoursPerTon != null ? phase.hoursPerTon : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Por tipo de diseño
              </h3>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.byDesignType.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin datos por tipo de diseño todavía.
                  </p>
                ) : (
                  data.byDesignType.map((dt) => (
                    <Card key={dt.designType}>
                      <CardHeader className="flex-row items-center justify-between gap-2">
                        <CardTitle className="text-sm">{dt.designType}</CardTitle>
                        <span className="text-sm font-semibold tabular-nums">
                          {dt.hoursPerTon != null ? `${dt.hoursPerTon} h/ton` : "—"}
                        </span>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="divide-y divide-border">
                          {dt.phases.map((phase) => (
                            <li
                              key={phase.phaseSlug}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <span className="text-muted-foreground">
                                {phase.phaseName}
                              </span>
                              <span className="tabular-nums">
                                {phase.hoursPerTon != null
                                  ? `${phase.hoursPerTon} h/ton`
                                  : "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </WorkspaceLayout>
    </>
  );
}
