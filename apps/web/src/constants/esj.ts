// Catálogo de roles del flujo "Acero estructural" (carriles del diagrama).
export const ESJ_ROLE_OPTIONS = [
  { key: "comercial", label: "Comercial" },
  { key: "glpi", label: "GLPI" },
  { key: "planeacion", label: "Planeación" },
  { key: "project-manager", label: "Project Manager" },
  { key: "cliente", label: "Cliente" },
  { key: "proyectos-esj", label: "Proyectos ESJ" },
  { key: "coordinador-ingenieria", label: "Coordinador Ingeniería" },
  { key: "lider-modelador", label: "Líder Modelador" },
  { key: "modelador", label: "Modelador" },
  { key: "lider-detallista", label: "Líder Detallista" },
  { key: "ingeniero-detallista", label: "Ingeniero Detallista" },
  { key: "capturista", label: "Capturista" },
] as const;

export const ESJ_ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ESJ_ROLE_OPTIONS.map((r) => [r.key, r.label]),
);

export const ESJ_PROJECT_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  aceptado: "Aceptado",
  "en-progreso": "En progreso",
  pausado: "Pausado",
  submittal: "Submittal",
  cerrado: "Cerrado",
  rechazado: "Rechazado",
};

export const ESJ_PHASE_STATUS_OPTIONS = [
  { key: "pending", label: "Pendiente" },
  { key: "in-progress", label: "En progreso" },
  { key: "blocked", label: "Bloqueada" },
  { key: "done", label: "Terminada" },
] as const;

export const ESJ_PHASE_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(ESJ_PHASE_STATUS_OPTIONS.map((s) => [s.key, s.label]));

// Etapas del ciclo de vida de un TICKET dentro de una fase. El tablero conserva
// sus columnas de estado (To Do/In Progress/...); la etapa es un atributo del
// ticket que indica en qué parte del flujo de ingeniería de acero va.
export const ESJ_TICKET_STAGE_OPTIONS = [
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

export type EsjTicketStageKey =
  (typeof ESJ_TICKET_STAGE_OPTIONS)[number]["key"];

export const ESJ_TICKET_STAGE_LABELS: Record<string, string> =
  Object.fromEntries(ESJ_TICKET_STAGE_OPTIONS.map((s) => [s.key, s.label]));

export const ESJ_DEFAULT_TICKET_STAGE: EsjTicketStageKey =
  ESJ_TICKET_STAGE_OPTIONS[0].key;

// Correo de ejemplo de SAP (acción zsd_email_cotizacion). Sirve para el botón
// de prueba mientras se conecta el BAPI real de SAP.
export const ESJ_SAMPLE_SAP_EMAIL = `Codigo SAP: SAP-noro-20260525-202844
Nombre Proyecto: Nave industrial ESJ Norte
Cliente: Constructora NoroTest
Solicitante: BrunoB
Fecha requerida: 2026-06-15
Prioridad: Alta
Area: Edificio 01
Tipo de diseno: Conexion y detalle
Toneladas: 125.50
Fecha conexion: 2026-06-01
Fecha submittal: 2026-06-20
Fases: Planeacion de proyecto; Entrega de diseno estructural; Aceptacion / asignacion de equipo; Modelado de conexiones; Planos de fabricacion; Submittal; Cierre de ingenieria
Piezas: C-101, V-220, PL-44, PL-43`;
