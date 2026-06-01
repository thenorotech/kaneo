import { normalizePriority } from "./constants";

export type ParsedSapProject = {
  sapCode: string;
  name: string;
  clientName: string;
  requester?: string;
  requiredDate?: Date;
  priority: string;
  priorityRaw?: string;
  designType?: string;
  totalTonnage: number;
  connectionDate?: Date;
  submittalDate?: Date;
  areas: string[];
  phases: string[];
  pieces: string[];
};

// Quita acentos y normaliza para comparar etiquetas del correo.
function normalizeLabel(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Cada línea del correo es "Etiqueta: valor". Construimos un mapa
// etiqueta-normalizada -> valor para leer de forma tolerante.
function buildFieldMap(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const label = normalizeLabel(line.slice(0, idx));
    const value = line.slice(idx + 1).trim();
    if (label && value && !map.has(label)) {
      map.set(label, value);
    }
  }
  return map;
}

function pick(
  map: Map<string, string>,
  ...labels: string[]
): string | undefined {
  for (const label of labels) {
    const value = map.get(normalizeLabel(label));
    if (value !== undefined && value !== "") return value;
  }
  return undefined;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseTonnage(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/[^0-9.,-]/g, "").replace(",", ".");
  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

function splitList(value: string | undefined, separators = /[;,]/): string[] {
  if (!value) return [];
  return value
    .split(separators)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Parsea el correo automático que SAP envía con la acción
 * `zsd_email_cotizacion`. El formato son líneas "Etiqueta: valor".
 * Es tolerante a acentos y a etiquetas equivalentes en español/inglés.
 */
export function parseSapEmail(raw: string): ParsedSapProject {
  const map = buildFieldMap(raw);

  const sapCode = pick(map, "Codigo SAP", "Código SAP", "SAP", "SAP Code");
  if (!sapCode) {
    throw new Error(
      "No se encontró el 'Código SAP' en el correo. Es obligatorio para identificar el proyecto.",
    );
  }

  const name =
    pick(
      map,
      "Nombre Proyecto",
      "Nombre del Proyecto",
      "Proyecto",
      "Project",
    ) ?? sapCode;
  const clientName =
    pick(map, "Cliente", "Client", "Customer") ?? "Sin cliente";
  const priorityRaw = pick(map, "Prioridad", "Priority");

  // El correo puede traer una o varias áreas separadas por ; o ,
  const areas = splitList(pick(map, "Area", "Área", "Areas", "Áreas"));

  return {
    sapCode: sapCode.trim(),
    name: name.trim(),
    clientName: clientName.trim(),
    requester: pick(map, "Solicitante", "Requester"),
    requiredDate: parseDate(pick(map, "Fecha requerida", "Required Date")),
    priority: normalizePriority(priorityRaw),
    priorityRaw,
    designType: pick(map, "Tipo de diseno", "Tipo de diseño", "Design Type"),
    totalTonnage: parseTonnage(pick(map, "Toneladas", "Tonelaje", "Tons")),
    connectionDate: parseDate(pick(map, "Fecha conexion", "Fecha conexión")),
    submittalDate: parseDate(pick(map, "Fecha submittal", "Submittal Date")),
    areas: areas.length > 0 ? areas : ["General"],
    phases: splitList(pick(map, "Fases", "Phases"), /;/),
    pieces: splitList(pick(map, "Piezas", "Pieces")),
  };
}
