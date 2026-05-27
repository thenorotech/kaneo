import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import useProjectStore from "@/store/project";
import { useGetTasks } from "@/hooks/queries/task/use-get-tasks";
import { useEffect } from "react";
import CharterEditor from "@/components/charter/charter-editor";
import CharterApprovalWorkflow from "@/components/charter/charter-approval-workflow";
import CharterStatusBadge from "@/components/charter/charter-status-badge";
import { useCharter } from "@/hooks/queries/macom-charter/use-charter";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/charter",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { projectId, workspaceId } = Route.useParams();
  const { project, setProject } = useProjectStore();
  const { data } = useGetTasks(projectId);
  const { data: charterData } = useCharter(projectId);

  useEffect(() => {
    if (data) {
      setProject(data);
    }
  }, [data, setProject]);

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="charter"
    >
      <PageTitle
        title={`${project?.name} — Charter`}
        hideAppName
      />
      <div className="relative flex flex-col h-full min-h-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Project Charter</h1>
                <p className="text-muted-foreground">
                  Draft, review, and approve the project charter.
                </p>
              </div>
              {charterData?.charterStatus && <CharterStatusBadge status={charterData.charterStatus} />}
            </div>
            
            <CharterApprovalWorkflow projectId={projectId} />
            <CharterEditor projectId={projectId} />
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
