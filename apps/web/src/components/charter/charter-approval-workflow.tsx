import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApproveCharter } from "@/hooks/mutations/macom-charter/use-approve-charter";
import { useReturnCharter } from "@/hooks/mutations/macom-charter/use-return-charter";
import { useCharter } from "@/hooks/queries/macom-charter/use-charter";
import { useAutoCreate } from "@/hooks/mutations/macom-charter/use-auto-create";

type CharterApprovalWorkflowProps = {
  projectId: string;
};

export default function CharterApprovalWorkflow({ projectId }: CharterApprovalWorkflowProps) {
  const { data } = useCharter(projectId);
  const { mutate: approve, isPending: isApproving } = useApproveCharter();
  const { mutate: returnCharter, isPending: isReturning } = useReturnCharter();
  const { mutate: autoCreate, isPending: isAutoCreating } = useAutoCreate();
  const [comment, setComment] = useState("");

  const status = data?.charterStatus;
  
  if (status === "approved") {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 space-y-4">
        <p className="text-sm text-green-800 font-medium">This charter has been fully approved.</p>
        <Button onClick={() => autoCreate({ projectId })} disabled={isAutoCreating}>
          {isAutoCreating ? "Creating..." : "Auto-create Sprints & Tasks"}
        </Button>
      </div>
    );
  }

  if (status !== "pending_approval") return null;

  return (
    <div className="space-y-4 rounded-md border p-4 bg-card">
      <h3 className="font-semibold text-lg">Approval Workflow</h3>
      <p className="text-sm text-muted-foreground">Review the charter and provide your approval or return it with observations.</p>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Observations (if returning)</label>
        <Textarea 
          value={comment} 
          onChange={(e) => setComment(e.target.value)} 
          placeholder="State any issues that need fixing..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          onClick={() => approve({ projectId, role: "pm" })} 
          disabled={isApproving}
        >
          Approve as PM
        </Button>
        <Button 
          variant="outline" 
          onClick={() => approve({ projectId, role: "leader" })} 
          disabled={isApproving}
        >
          Approve as Leader
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => returnCharter({ projectId, comment })} 
          disabled={isReturning || !comment.trim()}
        >
          Return to Draft
        </Button>
      </div>
    </div>
  );
}
