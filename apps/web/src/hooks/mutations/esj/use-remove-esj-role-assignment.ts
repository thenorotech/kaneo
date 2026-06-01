import { useMutation, useQueryClient } from "@tanstack/react-query";
import removeEsjRoleAssignment, {
  type RemoveEsjRoleAssignmentRequest,
} from "@/fetchers/esj/remove-esj-role-assignment";

function useRemoveEsjRoleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveEsjRoleAssignmentRequest) =>
      removeEsjRoleAssignment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["esj-role-assignments", variables.workspaceId],
      });
    },
  });
}

export default useRemoveEsjRoleAssignment;
