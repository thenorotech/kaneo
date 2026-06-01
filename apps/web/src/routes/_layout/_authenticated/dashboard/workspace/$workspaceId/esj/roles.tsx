import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESJ_ROLE_OPTIONS } from "@/constants/esj";
import useAssignEsjRole from "@/hooks/mutations/esj/use-assign-esj-role";
import useRemoveEsjRoleAssignment from "@/hooks/mutations/esj/use-remove-esj-role-assignment";
import useGetEsjRoleAssignments from "@/hooks/queries/esj/use-get-esj-role-assignments";
import { useGetActiveWorkspaceUsers } from "@/hooks/queries/workspace-users/use-get-active-workspace-users";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/esj/roles",
)({
  component: RouteComponent,
});

const selectClassName =
  "h-8 min-w-44 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [roleKey, setRoleKey] = useState<string>(ESJ_ROLE_OPTIONS[0].key);

  const { data: members } = useGetActiveWorkspaceUsers(workspaceId);
  const { data: assignments, isLoading } =
    useGetEsjRoleAssignments(workspaceId);
  const assignRole = useAssignEsjRole();
  const removeAssignment = useRemoveEsjRoleAssignment();
  const { canManageProjects } = useWorkspacePermission();
  const canManage = canManageProjects();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Selecciona un usuario");
      return;
    }
    try {
      await assignRole.mutateAsync({ workspaceId, userId, roleKey });
      toast.success("Rol asignado");
      setUserId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo asignar el rol",
      );
    }
  };

  const handleRemove = async (assignmentId: string) => {
    try {
      await removeAssignment.mutateAsync({ assignmentId, workspaceId });
      toast.success("Asignación eliminada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar",
      );
    }
  };

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

  return (
    <>
      <PageTitle title="Roles del flujo ESJ" />
      <WorkspaceLayout title="Roles del flujo ESJ" headerActions={backAction}>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Asigna a cada persona su rol en el flujo de acero estructural. Al
            crear un proyecto desde SAP, cada fase se asigna automáticamente a
            la persona con el rol correspondiente y menor carga de trabajo.
          </p>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Asignar rol</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form
                  onSubmit={handleAssign}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Usuario
                    </span>
                    <select
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className={selectClassName}
                      aria-label="Usuario"
                    >
                      <option value="">Selecciona…</option>
                      {(members ?? []).map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.user?.name ??
                            member.user?.email ??
                            member.userId}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Rol</span>
                    <select
                      value={roleKey}
                      onChange={(e) => setRoleKey(e.target.value)}
                      className={selectClassName}
                      aria-label="Rol"
                    >
                      {ESJ_ROLE_OPTIONS.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    loading={assignRole.isPending}
                    disabled={!userId}
                  >
                    Asignar
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">
                  Usuario
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Correo
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Rol
                </TableHead>
                <TableHead className="text-foreground font-medium" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Cargando…
                  </TableCell>
                </TableRow>
              ) : !assignments || assignments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Aún no hay roles asignados.
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="py-3 text-sm font-medium">
                      {assignment.userName}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {assignment.userEmail}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="secondary">{assignment.roleLabel}</Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(assignment.id)}
                          aria-label="Eliminar asignación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </WorkspaceLayout>
    </>
  );
}
