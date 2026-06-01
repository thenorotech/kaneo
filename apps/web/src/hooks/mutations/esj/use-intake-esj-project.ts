import { useMutation, useQueryClient } from "@tanstack/react-query";
import intakeEsjProject, {
  type IntakeEsjProjectRequest,
} from "@/fetchers/esj/intake-esj-project";

function useIntakeEsjProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IntakeEsjProjectRequest) => intakeEsjProject(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["esj-projects", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export default useIntakeEsjProject;
