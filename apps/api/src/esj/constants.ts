// Roles del flujo "Acero estructural" (carriles del diagrama).
export const ESJ_ROLE_KEYS = [
  "comercial",
  "glpi",
  "planeacion",
  "project-manager",
  "cliente",
  "proyectos-esj",
  "coordinador-ingenieria",
  "lider-modelador",
  "modelador",
  "lider-detallista",
  "ingeniero-detallista",
  "capturista",
] as const;

export type EsjRoleKey = (typeof ESJ_ROLE_KEYS)[number];

export const ESJ_ROLE_LABELS: Record<EsjRoleKey, string> = {
  comercial: "Comercial",
  glpi: "GLPI",
  planeacion: "Planeación",
  "project-manager": "Project Manager",
  cliente: "Cliente",
  "proyectos-esj": "Proyectos ESJ",
  "coordinador-ingenieria": "Coordinador Ingeniería",
  "lider-modelador": "Líder Modelador",
  modelador: "Modelador",
  "lider-detallista": "Líder Detallista",
  "ingeniero-detallista": "Ingeniero Detallista",
  capturista: "Capturista",
};

export function isEsjRoleKey(value: string): value is EsjRoleKey {
  return (ESJ_ROLE_KEYS as readonly string[]).includes(value);
}

// Estados del ciclo de vida de un proyecto ESJ (alineados al diagrama).
export const ESJ_PROJECT_STATUSES = [
  "pendiente",
  "asignado",
  "aceptado",
  "en-progreso",
  "pausado",
  "submittal",
  "cerrado",
  "rechazado",
] as const;

export const ESJ_PHASE_STATUSES = [
  "pending",
  "in-progress",
  "blocked",
  "done",
] as const;

// Etapas del ciclo de vida de un TICKET (no de la fase). Una fase es una
// división de trabajo en paralelo que crea el PM; dentro de cada fase los
// tickets avanzan por estas etapas estándar de ingeniería de acero.
export const ESJ_TICKET_STAGES = [
  { key: "planeacion-de-proyecto", label: "Planeación de proyecto" },
  {
    key: "entrega-de-diseno-estructural",
    label: "Entrega de diseño estructural",
  },
  {
    key: "aceptacion-asignacion-de-equipo",
    label: "Aceptación / asignación de equipo",
  },
  { key: "modelado-de-conexiones", label: "Modelado de conexiones" },
  { key: "planos-de-fabricacion", label: "Planos de fabricación" },
  { key: "submittal", label: "Submittal" },
  { key: "cierre-de-ingenieria", label: "Cierre de ingeniería" },
] as const;

export const ESJ_TICKET_STAGE_KEYS = ESJ_TICKET_STAGES.map(
  (stage) => stage.key,
) as [string, ...string[]];

export const ESJ_DEFAULT_TICKET_STAGE = ESJ_TICKET_STAGES[0].key;

export function isEsjTicketStage(value: string): boolean {
  return (ESJ_TICKET_STAGE_KEYS as readonly string[]).includes(value);
}

// Mapeo de fases conocidas (por slug) al rol que arranca la fase, para
// alimentar la cola de trabajo. Las fases que no estén aquí quedan sin rol.
export const ESJ_PHASE_DEFAULT_ROLE: Record<string, EsjRoleKey> = {
  "planeacion-de-proyecto": "planeacion",
  "entrega-de-diseno-estructural": "coordinador-ingenieria",
  "aceptacion-asignacion-de-equipo": "coordinador-ingenieria",
  "modelado-de-conexiones": "modelador",
  "planos-de-fabricacion": "ingeniero-detallista",
  submittal: "project-manager",
  "cierre-de-ingenieria": "coordinador-ingenieria",
};

// Umbral de complejidad del diagrama: <100 Ton o 1 área => baja complejidad
// (la lleva el PM); >100 Ton o 2+ áreas / exportación => Planeación.
export const ESJ_COMPLEXITY_TONNAGE_THRESHOLD = 100;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Normaliza una prioridad en español (Alta/Media/Baja/Urgente) al set de kaneo.
export function normalizePriority(value: string | undefined): string {
  const v = (value ?? "").trim().toLowerCase();
  if (["urgente", "urgent", "critica", "crítica"].includes(v)) return "urgent";
  if (["alta", "high"].includes(v)) return "high";
  if (["media", "medium", "normal"].includes(v)) return "medium";
  if (["baja", "low"].includes(v)) return "low";
  return "medium";
}
