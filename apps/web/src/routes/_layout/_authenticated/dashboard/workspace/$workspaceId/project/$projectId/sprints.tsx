import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import { useSprints } from "@/hooks/queries/sprint/use-sprints";
import { useGetTasks } from "@/hooks/queries/task/use-get-tasks";
import useProjectStore from "@/store/project";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/sprints",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId, workspaceId } = Route.useParams();
  const { project, setProject } = useProjectStore();
  const { data } = useGetTasks(projectId);
  const { data: sprints, isLoading } = useSprints(projectId);

  useEffect(() => {
    if (data) {
      setProject(data);
    }
  }, [data, setProject]);

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="board" // We could add sprint as an active view in ProjectLayout later
    >
      <PageTitle title={`${project?.name} — Sprints`} hideAppName />
      <div className="relative flex flex-col h-full min-h-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <h1 className="text-2xl font-bold">Project Sprints</h1>
            <p className="text-muted-foreground">
              Manage your project sprints here.
            </p>
            {isLoading ? (
              <div>Loading sprints...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sprints?.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="rounded-xl border bg-card text-card-foreground shadow p-4"
                  >
                    <h3 className="font-semibold leading-none tracking-tight mb-2">
                      {sprint.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {sprint.reviewNotes || "No review notes specified"}
                    </p>
                    <div className="text-xs font-medium bg-secondary inline-block px-2 py-1 rounded">
                      Status: {sprint.status}
                    </div>
                  </div>
                ))}
                {!sprints?.length && (
                  <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed rounded-xl">
                    No sprints found. Ensure your charter is approved to
                    auto-generate sprints, or create one manually.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
