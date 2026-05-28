import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { submitCharter } from "../../../fetchers/macom-charter/submit-charter";
import { getCharterQueryKey } from "../../queries/macom-charter/use-charter";

export function useSubmitCharter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCharter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getCharterQueryKey(variables.projectId),
      });
      // Assuming getProjectQueryKey takes (id, workspaceId). The project status changed, so invalidating project is good too.
      // We'll just invalidate all projects to be safe if we don't have workspaceId here.
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Charter enviado a aprobación");
    },
    onError: (error: Error) => {
      console.error("Error submitting charter:", error);
      toast.error(error.message || "Error al enviar el Charter a aprobación");
    },
  });
}
