# Documentación del Sistema: PMS (Project Manager SaaS)

Este documento detalla la lógica de negocio implementada, los recientes arreglos de infraestructura para lograr el despliegue a producción, y el flujo de operación esperado para los usuarios del sistema.

---

## 1. Lo que se hizo: Resolución de Infraestructura y Despliegue

El proyecto enfrentaba problemas críticos que impedían su ejecución en el entorno de producción (Dokploy/Docker). Se implementaron tres soluciones arquitectónicas definitivas:

1. **Resolución del Conflicto de Módulos (ESM vs CommonJS):**
   * **Problema:** La API (Node.js moderno usando ESM) intentaba consumir paquetes internos del monorepo (`@kaneo/email`, `@kaneo/permissions`) que estaban pre-compilados en un formato antiguo (CommonJS), lo que causaba el error `Dynamic require is not supported`.
   * **Solución:** Se configuró el empaquetador (`esbuild.config.js`) con un sistema de **alias maestros**. Ahora, en producción, la API ignora los archivos pre-compilados y lee directamente el código fuente moderno (`.ts` / `.tsx`) de los sub-paquetes. Toda la API se compila de forma nativa a ESM en un solo paso.

2. **Resolución de Dependencias Fantasma (pnpm strictness):**
   * **Problema:** Al ejecutarse en Docker, la API no encontraba librerías como `@react-email/components` (`ERR_MODULE_NOT_FOUND`) porque `pnpm` las ocultaba al no estar declaradas explícitamente en el `package.json` de la API.
   * **Solución:** Se agregaron explícitamente las dependencias de ejecución al `package.json` de la API y se habilitó el izado público (`public-hoist-pattern`) en el `Dockerfile` para garantizar que Node.js tenga acceso a todas las librerías necesarias en tiempo de ejecución.

3. **Corrección de Migraciones de Base de Datos (Drizzle ORM):**
   * **Problema:** El contenedor fallaba al arrancar porque la migración `0032` intentaba crear columnas e índices (ej. `updated_at` en notificaciones) que ya habían sido creados por la migración `0029`.
   * **Solución:** Se depuró manualmente el archivo SQL de la migración `0032`, eliminando las instrucciones DDL duplicadas. Esto permitió que la base de datos aplicara los cambios limpiamente y la API encendiera exitosamente.
   * **Expansión de UI:** Se actualizó el componente frontal `charter-editor.tsx` para exponer todos los campos diseñados en la base de datos (Scope, KPIs, Budget, Risks, etc.).

---

## 2. Lógica de Negocio: Proceso de Operación del Sistema

El núcleo de la gestión de proyectos de este PMS gira en torno a la formalización mediante el **Acta de Constitución del Proyecto (Project Charter)** y la ejecución iterativa mediante **Sprints**.

### A. Flujo de Trabajo del Acta de Constitución (Charter Workflow)

El Charter es el documento fundacional de cualquier proyecto. Su ciclo de vida es el siguiente:

1. **Fase de Borrador (Drafting):**
   * El creador del proyecto llena los detalles exhaustivos del proyecto: Objetivos, Alcance, Entregables, Requerimientos, Riesgos, Presupuesto, Factores Críticos, etc.
   * El usuario puede guardar el borrador múltiples veces (`Save Draft`).
   * **Lógica Interna:** Cada vez que se guarda, se registra un evento en la tabla `charter_event` y se guarda una copia exacta (snapshot) en `charter_version`. Esto crea un **historial de auditoría inmutable** (Control de Versiones).

2. **Sometimiento a Aprobación (Submit for Approval):**
   * Una vez completado, el usuario envía el documento a revisión. El estado del proyecto cambia y el formulario se bloquea para evitar ediciones clandestinas.

3. **Revisión y Aprobación (Review & Approval):**
   * Los perfiles con roles superiores (Project Manager / Leader) revisan el documento.
   * **Aprobación:** Si todo es correcto, se aprueba. Se estampan las firmas digitales (`pm_approved_by`, `leader_approved_by`) y las fechas exactas de aprobación.
   * **Retorno con Observaciones:** Si hay deficiencias, el revisor devuelve el documento a estado de edición adjuntando comentarios. El creador original debe corregir y volver a someter.

### B. Transición a la Ejecución (Auto-creación)

Una vez que el Acta de Constitución es aprobada, el sistema permite **Auto-crear** la estructura de trabajo:
* Basado en el cronograma preliminar (`preliminary_schedule`) definido en el Charter, el sistema genera automáticamente los **Sprints** (bloques de tiempo con metas específicas).
* Genera las **Tareas (Tasks)** iniciales y las asigna a los Sprints correspondientes (`sprint_id`).

### C. Ejecución y Monitoreo (Sprints & Tasks)

* **Sprints:** Organizan el trabajo en iteraciones. Cada Sprint tiene un estado (`planned`, `active`, `completed`), fechas de inicio/fin y una meta (`goal`).
* **Tasks:** Las tareas viajan por tableros (Columns), tienen responsables (`assignee_id`) y se asocian a un Sprint.
* **Trazabilidad de Tiempo:** Los usuarios registran el tiempo invertido en las tareas mediante `time_entry`, permitiendo comparar el esfuerzo real contra el Presupuesto/Cronograma definido originalmente en el Charter.

---

## 3. Comportamiento Esperado del Usuario (User Journey)

1. **Registro:** El usuario ingresa a la URL de producción y crea una cuenta nueva (la base de datos inicia vacía).
2. **Creación de Workspace:** El usuario crea un espacio de trabajo para su organización.
3. **Inicio de Proyecto:** Se crea un nuevo proyecto, el cual nace automáticamente en estado `pending_charter`.
4. **Planificación:** El usuario entra a la pestaña del Charter, llena toda la información ejecutiva y la somete a aprobación.
5. **Aprobación:** Otro miembro con permisos revisa y aprueba el documento.
6. **Arranque:** Se dispara la creación automática de Sprints.
7. **Operación Diaria:** El equipo mueve tarjetas de tareas, registra tiempos y se comunica a través de comentarios, todo alineado a los KPIs y objetivos del Charter aprobado.
