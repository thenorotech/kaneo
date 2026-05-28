import { format } from "date-fns";

// biome-ignore lint/suspicious/noExplicitAny: Drizzle schema payload is flexible
export default function CharterPrintView({ charter }: { charter: any }) {
  if (!charter) return null;

  return (
    <div className="hidden print:block print:w-full print:bg-white print:text-black font-sans text-xs">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-32">
          <img
            src="/macomlogo.png"
            alt="MACOM Logo"
            className="max-w-full h-auto object-contain"
          />
        </div>
        <div className="text-center font-bold text-sm">
          <div>PLAN MAESTRO</div>
          <div>PROYECTOS</div>
          <div className="mt-2 text-lg">ACTA DE PROYECTO</div>
        </div>
        <div className="w-32" /> {/* Spacer to keep title centered */}
      </div>

      {/* Info Sections */}
      <table className="w-full mb-4 border-collapse">
        <tbody>
          <tr>
            <td className="w-1/3 font-bold py-1">1. Nombre del proyecto:</td>
            <td className="border-b border-black py-1">
              {charter.projectName}
            </td>
          </tr>
          <tr>
            <td className="font-bold py-1">2. Tipo de proyecto:</td>
            <td className="border-b border-black py-1">
              {charter.projectType}
            </td>
          </tr>
          <tr>
            <td className="font-bold py-1">
              3. Área o departamento responsable:
            </td>
            <td className="border-b border-black py-1">
              {charter.responsibleArea}
            </td>
          </tr>
          <tr>
            <td className="font-bold py-1">4. Responsable del proyecto:</td>
            <td className="border-b border-black py-1">
              {charter.projectManager}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 5. Equipo */}
      <div className="border border-black mb-4">
        <div className="bg-gray-200 text-center font-bold border-b border-black py-1">
          5. Equipo del proyecto / Colaboradores clave
        </div>
        <table className="w-full border-collapse text-center">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="border-r border-black py-1">Nombre</th>
              <th className="border-r border-black py-1">Rol</th>
              <th className="py-1">Responsabilidad clave</th>
            </tr>
          </thead>
          <tbody>
            {/* biome-ignore lint/suspicious/noExplicitAny: Dynamic array */}
            {(charter.keyCollaborators || []).map((col: any, i: number) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Print view static render
              <tr key={i} className="border-b border-black last:border-0">
                <td className="border-r border-black p-1">{col.name}</td>
                <td className="border-r border-black p-1">{col.role}</td>
                <td className="p-1">{col.responsibility}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <span className="font-bold">6. Fecha de elaboración del acta:</span>{" "}
        <span className="border-b border-black inline-block w-64 text-center">
          {charter.elaborationDate
            ? format(
                new Date(charter.elaborationDate),
                "dd 'de' MMMM 'del' yyyy",
              )
            : ""}
        </span>
      </div>

      {/* Basic Text Sections */}
      {[
        {
          title: "7. Propósito u objetivo del proyecto",
          content: charter.objective,
        },
        {
          title: "8. Descripción de alto nivel del proyecto",
          content: charter.highLevelDescription,
        },
        {
          title: "9. Alcance del proyecto (límites del proyecto)",
          content: charter.scope,
        },
        {
          title: "10. Entregables clave del proyecto",
          content: charter.keyDeliverables,
        },
        {
          title: "11. Requerimientos de alto nivel",
          content: charter.highLevelRequirements,
        },
        {
          title: "12. Supuestos y restricciones",
          content: charter.assumptionsRestrictions,
        },
      ].map((section, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static map
        <div key={idx} className="border border-black mb-4">
          <div className="bg-gray-200 text-center font-bold border-b border-black py-1">
            {section.title}
          </div>
          <div className="p-2 whitespace-pre-wrap">{section.content}</div>
        </div>
      ))}

      {/* Page break trick if needed */}
      <div className="break-before-page" />

      {/* 14. Cronograma */}
      <div className="border border-black mb-4 mt-4">
        <div className="bg-gray-200 text-center font-bold border-b border-black py-1">
          14. Cronograma preliminar / Fechas importantes
        </div>
        <table className="w-full border-collapse text-center">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="border-r border-black py-1">Partida</th>
              <th className="border-r border-black py-1">Descripcion</th>
              <th className="border-r border-black py-1">Fecha de Inicio</th>
              <th className="py-1">Fecha de cierre</th>
            </tr>
          </thead>
          <tbody>
            {/* biome-ignore lint/suspicious/noExplicitAny: Dynamic array */}
            {(charter.preliminarySchedule || []).map((item: any, i: number) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Print view static render
              <tr key={i} className="border-b border-black last:border-0">
                <td className="border-r border-black p-1">{item.phase}</td>
                <td className="border-r border-black p-1">
                  {item.description}
                </td>
                <td className="border-r border-black p-1">{item.startDate}</td>
                <td className="p-1">{item.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* More text sections */}
      {[
        {
          title: "15. Presupuesto preliminar (si aplica)",
          content: charter.preliminaryBudget,
        },
        {
          title: "16. Recursos necesarios",
          content: charter.necessaryResources,
        },
        {
          title: "17. Riesgo global del proyecto",
          content: charter.overallRisk,
        },
        { title: "18. Criterios de éxito", content: charter.successCriteria },
        {
          title: "19. Indicadores clave de desempeño (KPIs)",
          content: charter.kpis,
        },
        {
          title: "20. Mecanismo de seguimiento y control",
          content: charter.trackingControlMechanism,
        },
      ].map((section, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static map
        <div key={idx} className="border border-black mb-4">
          <div className="bg-gray-200 text-center font-bold border-b border-black py-1">
            {section.title}
          </div>
          <div className="p-2 whitespace-pre-wrap">{section.content}</div>
        </div>
      ))}

      <div className="mb-4">
        <span className="font-bold">21. Plan de comunicación:</span>{" "}
        {(charter.communicationPlan || []).join(", ")}
      </div>

      {/* 22. Dependencias */}
      <div className="border border-black mb-8">
        <div className="bg-gray-200 text-center font-bold border-b border-black py-1">
          22. Dependencias / Proyectos relacionados
        </div>
        <table className="w-full border-collapse text-center">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="border-r border-black py-1">
                Código del proyecto
              </th>
              <th className="border-r border-black py-1">
                Nombre del proyecto
              </th>
              <th className="border-r border-black py-1">Departamento</th>
              <th className="border-r border-black py-1">Enlace</th>
              <th className="py-1">Contacto</th>
            </tr>
          </thead>
          <tbody>
            {/* biome-ignore lint/suspicious/noExplicitAny: Dynamic array */}
            {(charter.relatedProjects || []).map((rel: any, i: number) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Print view static render
              <tr key={i} className="border-b border-black last:border-0">
                <td className="border-r border-black p-1">{rel.code}</td>
                <td className="border-r border-black p-1">{rel.name}</td>
                <td className="border-r border-black p-1">{rel.department}</td>
                <td className="border-r border-black p-1">{rel.link}</td>
                <td className="p-1">{rel.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-12 mb-4">
        <div className="bg-gray-200 text-center font-bold border border-black py-1 mb-8">
          23. Aprobaciones iniciales
        </div>
        <div className="flex justify-between px-16 text-center">
          <div className="w-1/3">
            <div className="mb-12">Elaborado por:</div>
            <div className="border-t border-black pt-2">
              {charter.projectManager || "Project Manager"}
            </div>
          </div>
          <div className="w-1/3">
            <div className="mb-12">Autorizado por:</div>
            <div className="border-t border-black pt-2">
              Líder del Proyecto / Director
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
