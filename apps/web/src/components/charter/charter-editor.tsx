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
    projectType: "",
    responsibleArea: "",
    projectManager: "",
    objective: "",
    highLevelDescription: "",
    scope: "",
    keyDeliverables: "",
    highLevelRequirements: "",
    assumptionsRestrictions: "",
    overallRisk: "",
    successCriteria: "",
    kpis: "",
    trackingControlMechanism: "",
    necessaryResources: "",
    preliminaryBudget: "",
    criticalFactors: "",
  });

  // Initialize form when data loads
  useState(() => {
    if (data?.charter) {
      setFormData({
        projectName: data.charter.projectName || "",
        projectType: data.charter.projectType || "",
        responsibleArea: data.charter.responsibleArea || "",
        projectManager: data.charter.projectManager || "",
        objective: data.charter.objective || "",
        highLevelDescription: data.charter.highLevelDescription || "",
        scope: data.charter.scope || "",
        keyDeliverables: data.charter.keyDeliverables || "",
        highLevelRequirements: data.charter.highLevelRequirements || "",
        assumptionsRestrictions: data.charter.assumptionsRestrictions || "",
        overallRisk: data.charter.overallRisk || "",
        successCriteria: data.charter.successCriteria || "",
        kpis: data.charter.kpis || "",
        trackingControlMechanism: data.charter.trackingControlMechanism || "",
        necessaryResources: data.charter.necessaryResources || "",
        preliminaryBudget: data.charter.preliminaryBudget || "",
        criticalFactors: data.charter.criticalFactors || "",
      });
    }
  }, [data]);

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
        <div className="grid grid-cols-2 gap-4">
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
            <label
              htmlFor="projectType"
              className="mb-1 block text-sm font-medium"
            >
              Project Type
            </label>
            <Input
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div>
            <label
              htmlFor="responsibleArea"
              className="mb-1 block text-sm font-medium"
            >
              Responsible Area
            </label>
            <Input
              id="responsibleArea"
              name="responsibleArea"
              value={formData.responsibleArea}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div>
            <label
              htmlFor="projectManager"
              className="mb-1 block text-sm font-medium"
            >
              Project Manager
            </label>
            <Input
              id="projectManager"
              name="projectManager"
              value={formData.projectManager}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
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
          <label
            htmlFor="highLevelDescription"
            className="mb-1 block text-sm font-medium"
          >
            High Level Description
          </label>
          <Textarea
            id="highLevelDescription"
            name="highLevelDescription"
            value={formData.highLevelDescription}
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
        <div>
          <label
            htmlFor="highLevelRequirements"
            className="mb-1 block text-sm font-medium"
          >
            High Level Requirements
          </label>
          <Textarea
            id="highLevelRequirements"
            name="highLevelRequirements"
            value={formData.highLevelRequirements}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="assumptionsRestrictions"
            className="mb-1 block text-sm font-medium"
          >
            Assumptions & Restrictions
          </label>
          <Textarea
            id="assumptionsRestrictions"
            name="assumptionsRestrictions"
            value={formData.assumptionsRestrictions}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="overallRisk"
            className="mb-1 block text-sm font-medium"
          >
            Overall Risk
          </label>
          <Textarea
            id="overallRisk"
            name="overallRisk"
            value={formData.overallRisk}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="successCriteria"
            className="mb-1 block text-sm font-medium"
          >
            Success Criteria
          </label>
          <Textarea
            id="successCriteria"
            name="successCriteria"
            value={formData.successCriteria}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label htmlFor="kpis" className="mb-1 block text-sm font-medium">
            KPIs
          </label>
          <Textarea
            id="kpis"
            name="kpis"
            value={formData.kpis}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="trackingControlMechanism"
            className="mb-1 block text-sm font-medium"
          >
            Tracking & Control Mechanism
          </label>
          <Textarea
            id="trackingControlMechanism"
            name="trackingControlMechanism"
            value={formData.trackingControlMechanism}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="necessaryResources"
            className="mb-1 block text-sm font-medium"
          >
            Necessary Resources
          </label>
          <Textarea
            id="necessaryResources"
            name="necessaryResources"
            value={formData.necessaryResources}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="preliminaryBudget"
            className="mb-1 block text-sm font-medium"
          >
            Preliminary Budget
          </label>
          <Textarea
            id="preliminaryBudget"
            name="preliminaryBudget"
            value={formData.preliminaryBudget}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
        <div>
          <label
            htmlFor="criticalFactors"
            className="mb-1 block text-sm font-medium"
          >
            Critical Success Factors
          </label>
          <Textarea
            id="criticalFactors"
            name="criticalFactors"
            value={formData.criticalFactors}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
      </div>
    </div>
  );
}
