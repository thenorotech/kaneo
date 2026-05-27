import { eq, sql } from "drizzle-orm";
import db from "../../database";
import { projectTable, projectCharterTable, sprintTable, taskTable } from "../../database/schema";

export async function autoCreate(projectId: string, userId: string) {
  return db.transaction(async (tx) => {
    const project = await tx.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
    });

    if (!project || project.charterStatus !== "approved") {
      throw new Error("Project charter is not approved yet");
    }

    const charter = await tx.query.projectCharterTable.findFirst({
      where: eq(projectCharterTable.projectId, projectId),
    });

    if (!charter || !charter.preliminarySchedule) {
      throw new Error("Charter has no preliminary schedule");
    }

    const schedule = charter.preliminarySchedule as Array<{
      item: string;
      description: string;
      startDate: string;
      endDate: string;
    }>;

    const createdSprints = [];
    const createdTasks = [];

    // Get highest task number for this project
    const maxNumberResult = await tx
      .select({ max: sql<number>`max(${taskTable.number})` })
      .from(taskTable)
      .where(eq(taskTable.projectId, projectId));
    
    let nextTaskNumber = (maxNumberResult[0]?.max || 0) + 1;

    for (const item of schedule) {
      // 1. Create Sprint
      const [sprint] = await tx
        .insert(sprintTable)
        .values({
          projectId,
          name: item.item,
          goal: item.description,
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          status: "planned",
        })
        .returning();
      
      createdSprints.push(sprint);

      // 2. Create Task linked to sprint
      const [task] = await tx
        .insert(taskTable)
        .values({
          projectId,
          title: `Ejecutar: ${item.item}`,
          description: item.description,
          sprintId: sprint.id,
          userId,
          status: "to-do",
          dueDate: item.endDate ? new Date(item.endDate) : undefined,
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          number: nextTaskNumber++,
        })
        .returning();

      createdTasks.push(task);
    }

    return {
      success: true,
      sprintsCount: createdSprints.length,
      tasksCount: createdTasks.length,
    };
  });
}
