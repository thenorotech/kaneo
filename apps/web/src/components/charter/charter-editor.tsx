import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveCharter } from "@/hooks/mutations/macom-charter/use-save-charter";
import { useSubmitCharter } from "@/hooks/mutations/macom-charter/use-submit-charter";
import { useCharter } from "@/hooks/queries/macom-charter/use-charter";

type CharterEditorProps = {
  projectId: string;
};

export default function CharterEditor({ projectId }: CharterEditorProps) {
  const { data, isLoading } = useCharter(projectId);
  const { mutate: saveCharter, isPending: isSaving } = useSaveCharter();
  const { mutate: submitCharter, isPending: isSubmitting } = useSubmitCharter();

  const [formData, setFormData] = useState({
    projectName: "",
    objective: "",
    scope: "",
    keyDeliverables: "",
    // We can add the rest of the fields here
  });

  // Initialize form when data loads
  useState(() => {
    if (data?.charter) {
      setFormData({
        projectName: data.charter.projectName || "",
        objective: data.charter.objective || "",
        scope: data.charter.scope || "",
        keyDeliverables: data.charter.keyDeliverables || "",
      });
    }
  });

  if (isLoading) return <div>Loading charter...</div>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveDraft = () => {
    saveCharter({ projectId, data: formData });
  };

  const handleSubmit = () => {
    submitCharter({ projectId });
  };

  const status = data?.charterStatus || "pending_charter";
  const isEditable =
    status === "pending_charter" || status === "returned_with_observations";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Charter Details</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!isEditable || isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handleSubmit} disabled={!isEditable || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-md border p-4 bg-card">
        <div>
          <label
            htmlFor="projectName"
            className="mb-1 block text-sm font-medium"
          >
            Project Name
          </label>
          <Input
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="objective" className="mb-1 block text-sm font-medium">
            Objective
          </label>
          <Textarea
            id="objective"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="scope" className="mb-1 block text-sm font-medium">
            Scope
          </label>
          <Textarea
            id="scope"
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="keyDeliverables"
            className="mb-1 block text-sm font-medium"
          >
            Key Deliverables
          </label>
          <Textarea
            id="keyDeliverables"
            name="keyDeliverables"
            value={formData.keyDeliverables}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        {/* We can expand this with more fields as needed */}
      </div>
    </div>
  );
}
