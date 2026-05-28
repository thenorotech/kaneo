import { Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveCharter } from "@/hooks/mutations/macom-charter/use-save-charter";
import { useSubmitCharter } from "@/hooks/mutations/macom-charter/use-submit-charter";
import { useCharter } from "@/hooks/queries/macom-charter/use-charter";
import CharterPrintView from "./charter-print-view";

type CharterEditorProps = {
  projectId: string;
};

// Types for our complex arrays
type KeyCollaborator = { name: string; role: string; responsibility: string };
type ScheduleItem = {
  phase: string;
  description: string;
  startDate: string;
  endDate: string;
};
type RelatedProject = {
  code: string;
  name: string;
  department: string;
  link: string;
  contact: string;
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
    elaborationDate: "",
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
    keyCollaborators: [] as KeyCollaborator[],
    preliminarySchedule: [] as ScheduleItem[],
    communicationPlan: [] as string[],
    relatedProjects: [] as RelatedProject[],
  });

  // Initialize form when data loads
  useEffect(() => {
    if (data?.charter) {
      setFormData({
        projectName: data.charter.projectName || "",
        projectType: data.charter.projectType || "",
        responsibleArea: data.charter.responsibleArea || "",
        projectManager: data.charter.projectManager || "",
        elaborationDate: data.charter.elaborationDate
          ? new Date(data.charter.elaborationDate).toISOString().split("T")[0]
          : "",
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
        keyCollaborators: Array.isArray(data.charter.keyCollaborators)
          ? (data.charter.keyCollaborators as KeyCollaborator[])
          : [],
        preliminarySchedule: Array.isArray(data.charter.preliminarySchedule)
          ? (data.charter.preliminarySchedule as ScheduleItem[])
          : [],
        communicationPlan: Array.isArray(data.charter.communicationPlan)
          ? (data.charter.communicationPlan as string[])
          : [],
        relatedProjects: Array.isArray(data.charter.relatedProjects)
          ? (data.charter.relatedProjects as RelatedProject[])
          : [],
      });
    }
  }, [data]);

  if (isLoading) return <div>Loading charter...</div>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const plan = prev.communicationPlan;
      if (plan.includes(option)) {
        return { ...prev, communicationPlan: plan.filter((o) => o !== option) };
      }
      return { ...prev, communicationPlan: [...plan, option] };
    });
  };

  // --- Dynamic Array Handlers ---
  const handleCollaboratorChange = (
    index: number,
    key: keyof KeyCollaborator,
    value: string,
  ) => {
    setFormData((prev) => {
      const arr = [...prev.keyCollaborators];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, keyCollaborators: arr };
    });
  };

  const handleScheduleChange = (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const arr = [...prev.preliminarySchedule];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, preliminarySchedule: arr };
    });
  };

  const handleRelatedProjectChange = (
    index: number,
    key: keyof RelatedProject,
    value: string,
  ) => {
    setFormData((prev) => {
      const arr = [...prev.relatedProjects];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, relatedProjects: arr };
    });
  };

  const addCollaborator = () => {
    setFormData((prev) => ({
      ...prev,
      keyCollaborators: [
        ...prev.keyCollaborators,
        { name: "", role: "", responsibility: "" },
      ],
    }));
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => {
      const arr = [...prev.keyCollaborators];
      arr.splice(index, 1);
      return { ...prev, keyCollaborators: arr };
    });
  };

  const addSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      preliminarySchedule: [
        ...prev.preliminarySchedule,
        { phase: "", description: "", startDate: "", endDate: "" },
      ],
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData((prev) => {
      const arr = [...prev.preliminarySchedule];
      arr.splice(index, 1);
      return { ...prev, preliminarySchedule: arr };
    });
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      relatedProjects: [
        ...prev.relatedProjects,
        { code: "", name: "", department: "", link: "", contact: "" },
      ],
    }));
  };

  const removeProject = (index: number) => {
    setFormData((prev) => {
      const arr = [...prev.relatedProjects];
      arr.splice(index, 1);
      return { ...prev, relatedProjects: arr };
    });
  };

  const handleSaveDraft = () => {
    saveCharter({ projectId, json: formData });
  };

  const handleSubmit = () => {
    submitCharter({ projectId });
  };

  const handlePrint = () => {
    window.print();
  };

  const status = data?.charterStatus || "pending_charter";
  const isEditable =
    status === "pending_charter" || status === "returned_with_observations";

  const communicationOptions = ["Semanal", "Quincenal", "Mensual", "Otros"];

  return (
    <>
      <div className="print:hidden space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Charter Details</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!isEditable || isSaving}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isEditable || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
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
          <div>
            <label
              htmlFor="elaborationDate"
              className="mb-1 block text-sm font-medium"
            >
              Elaboration Date
            </label>
            <Input
              id="elaborationDate"
              type="date"
              name="elaborationDate"
              value={formData.elaborationDate}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* 5. Equipo del Proyecto */}
        <div className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              5. Equipo del proyecto / Colaboradores clave
            </h3>
            {isEditable && (
              <Button size="sm" variant="outline" onClick={addCollaborator}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            )}
          </div>
          {formData.keyCollaborators.map((col, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: List is purely for simple editing
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="Nombre"
                value={col.name || ""}
                onChange={(e) =>
                  handleCollaboratorChange(idx, "name", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Rol"
                value={col.role || ""}
                onChange={(e) =>
                  handleCollaboratorChange(idx, "role", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Responsabilidad clave"
                value={col.responsibility || ""}
                onChange={(e) =>
                  handleCollaboratorChange(
                    idx,
                    "responsibility",
                    e.target.value,
                  )
                }
                disabled={!isEditable}
              />
              {isEditable && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeCollaborator(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Text Areas */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="objective"
              className="mb-1 block text-sm font-medium"
            >
              7. Propósito u objetivo del proyecto
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
              8. Descripción de alto nivel del proyecto
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
              9. Alcance del proyecto (límites del proyecto)
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
              10. Entregables clave del proyecto
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
              11. Requerimientos de alto nivel
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
              12. Supuestos y restricciones
            </label>
            <Textarea
              id="assumptionsRestrictions"
              name="assumptionsRestrictions"
              value={formData.assumptionsRestrictions}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* 14. Cronograma Preliminar */}
        <div className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              14. Cronograma preliminar / Fechas importantes
            </h3>
            {isEditable && (
              <Button size="sm" variant="outline" onClick={addSchedule}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            )}
          </div>
          {formData.preliminarySchedule.map((item, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: List is purely for simple editing
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="Partida (Ej. Fase 1)"
                value={item.phase || ""}
                onChange={(e) =>
                  handleScheduleChange(idx, "phase", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Descripción"
                value={item.description || ""}
                onChange={(e) =>
                  handleScheduleChange(idx, "description", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                type="date"
                value={item.startDate || ""}
                onChange={(e) =>
                  handleScheduleChange(idx, "startDate", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                type="date"
                value={item.endDate || ""}
                onChange={(e) =>
                  handleScheduleChange(idx, "endDate", e.target.value)
                }
                disabled={!isEditable}
              />
              {isEditable && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeSchedule(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* More Text Areas */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="preliminaryBudget"
              className="mb-1 block text-sm font-medium"
            >
              15. Presupuesto preliminar
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
              htmlFor="necessaryResources"
              className="mb-1 block text-sm font-medium"
            >
              16. Recursos necesarios
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
              htmlFor="overallRisk"
              className="mb-1 block text-sm font-medium"
            >
              17. Riesgo global del proyecto
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
              18. Criterios de éxito
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
              19. Indicadores clave de desempeño (KPIs)
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
              20. Mecanismo de seguimiento y control
            </label>
            <Textarea
              id="trackingControlMechanism"
              name="trackingControlMechanism"
              value={formData.trackingControlMechanism}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* 21. Plan de Comunicación */}
        <div className="space-y-2">
          <label
            htmlFor="communicationPlanGroup"
            className="mb-1 block text-sm font-medium"
          >
            21. Plan de comunicación
          </label>
          <div id="communicationPlanGroup" className="flex gap-4">
            {communicationOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.communicationPlan.includes(opt)}
                  onChange={() => handleCheckboxChange(opt)}
                  disabled={!isEditable}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 22. Dependencias */}
        <div className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              22. Dependencias / Proyectos relacionados
            </h3>
            {isEditable && (
              <Button size="sm" variant="outline" onClick={addProject}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            )}
          </div>
          {formData.relatedProjects.map((rel, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: List is purely for simple editing
            <div key={idx} className="flex gap-2 items-center">
              <Input
                placeholder="Código"
                className="w-24"
                value={rel.code || ""}
                onChange={(e) =>
                  handleRelatedProjectChange(idx, "code", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Nombre"
                value={rel.name || ""}
                onChange={(e) =>
                  handleRelatedProjectChange(idx, "name", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Departamento"
                value={rel.department || ""}
                onChange={(e) =>
                  handleRelatedProjectChange(idx, "department", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Enlace"
                value={rel.link || ""}
                onChange={(e) =>
                  handleRelatedProjectChange(idx, "link", e.target.value)
                }
                disabled={!isEditable}
              />
              <Input
                placeholder="Contacto"
                value={rel.contact || ""}
                onChange={(e) =>
                  handleRelatedProjectChange(idx, "contact", e.target.value)
                }
                disabled={!isEditable}
              />
              {isEditable && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeProject(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Print View Component (Hidden on web, visible on print) */}
      <CharterPrintView charter={data?.charter || formData} />
    </>
  );
}
