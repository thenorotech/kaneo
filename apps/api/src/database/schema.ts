import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { mode: "date" }),
});

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
    activeTeamId: text("active_team_id"),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accountTable = pgTable(
  "account",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verificationTable = pgTable(
  "verification",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const workspaceTable = pgTable("workspace", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const workspaceUserTable = pgTable(
  "workspace_member",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
      }),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("workspace_member_workspaceId_idx").on(table.workspaceId),
    index("workspace_member_userId_idx").on(table.userId),
  ],
);

export const teamTable = pgTable(
  "team",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  (table) => [index("team_workspaceId_idx").on(table.workspaceId)],
);

export const teamMemberTable = pgTable(
  "team_member",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teamTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    index("teamMember_teamId_idx").on(table.teamId),
    index("teamMember_userId_idx").on(table.userId),
  ],
);

export const invitationTable = pgTable(
  "invitation",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    teamId: text("team_id"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_workspaceId_idx").on(table.workspaceId),
    index("invitation_email_idx").on(table.email),
    index("invitation_inviterId_idx").on(table.inviterId),
  ],
);

export const workspaceRoleTable = pgTable(
  "workspace_role",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: text("role").notNull(),
    permission: text("permission").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workspace_role_workspaceId_idx").on(table.workspaceId),
    index("workspace_role_role_idx").on(table.role),
  ],
);

export const projectTable = pgTable(
  "project",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    slug: text("slug").notNull(),
    icon: text("icon").default("Layout"),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    isPublic: boolean("is_public").default(false),
    archivedAt: timestamp("archived_at", { mode: "date" }),
  },
  (table) => [
    unique("project_workspace_id_id_unique").on(table.workspaceId, table.id),
  ],
);

export const columnTable = pgTable(
  "column",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    position: integer("position").notNull().default(0),
    icon: text("icon"),
    color: text("color"),
    isFinal: boolean("is_final").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("column_projectId_idx").on(table.projectId)],
);

export const workflowRuleTable = pgTable(
  "workflow_rule",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    integrationType: text("integration_type").notNull(),
    eventType: text("event_type").notNull(),
    columnId: text("column_id")
      .notNull()
      .references(() => columnTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workflow_rule_projectId_idx").on(table.projectId),
    index("workflow_rule_columnId_idx").on(table.columnId),
  ],
);

export const taskTable = pgTable(
  "task",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    position: integer("position").default(0),
    number: integer("number").default(1),
    userId: text("assignee_id").references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("to-do"),
    columnId: text("column_id").references(() => columnTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    priority: text("priority").default("low"),
    startDate: timestamp("start_date", { mode: "date" }),
    dueDate: timestamp("due_date", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_projectId_idx").on(table.projectId),
    index("task_dueDate_idx").on(table.dueDate),
    index("task_assigneeId_idx").on(table.userId),
    index("task_columnId_idx").on(table.columnId),
    unique("task_project_number_unique").on(table.projectId, table.number),
  ],
);

export const taskReminderSentTable = pgTable(
  "task_reminder_sent",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    reminderType: text("reminder_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_reminder_sent_taskId_idx").on(table.taskId),
    unique("task_reminder_sent_task_type_unique").on(
      table.taskId,
      table.reminderType,
    ),
  ],
);

export const timeEntryTable = pgTable(
  "time_entry",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id").references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    description: text("description"),
    startTime: timestamp("start_time", { mode: "date" }).notNull(),
    endTime: timestamp("end_time", { mode: "date" }),
    duration: integer("duration").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("time_entry_taskId_idx").on(table.taskId),
    index("time_entry_userId_idx").on(table.userId),
  ],
);

export const activityTable = pgTable(
  "activity",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id").references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    content: text("content"),
    eventData: jsonb("event_data"),
    externalUserName: text("external_user_name"),
    externalUserAvatar: text("external_user_avatar"),
    externalSource: text("external_source"),
    externalUrl: text("external_url"),
  },
  (table) => [
    index("activity_task_id_idx").on(table.taskId),
    index("activity_userId_idx").on(table.userId),
    unique("activity_task_external_source_external_url_unique").on(
      table.taskId,
      table.externalSource,
      table.externalUrl,
    ),
  ],
);

export const assetTable = pgTable(
  "asset",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    taskId: text("task_id").references(() => taskTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    activityId: text("activity_id").references(() => activityTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    objectKey: text("object_key").notNull().unique(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    kind: text("kind").notNull().default("image"),
    surface: text("surface").notNull().default("description"),
    createdBy: text("created_by").references(() => userTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("asset_workspaceId_idx").on(table.workspaceId),
    index("asset_projectId_idx").on(table.projectId),
    index("asset_taskId_idx").on(table.taskId),
    index("asset_activityId_idx").on(table.activityId),
    index("asset_createdBy_idx").on(table.createdBy),
  ],
);

export const labelTable = pgTable(
  "label",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    taskId: text("task_id").references(() => taskTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    workspaceId: text("workspace_id").references(() => workspaceTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    index("label_task_id_idx").on(table.taskId),
    index("label_workspace_id_idx").on(table.workspaceId),
    unique("label_task_name_unique").on(table.taskId, table.name),
    uniqueIndex("label_workspace_name_unique")
      .on(table.workspaceId, table.name)
      .where(sql`${table.taskId} is null`),
  ],
);

export const notificationTable = pgTable(
  "notification",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    title: text("title"),
    content: text("content"),
    type: text("type").notNull().default("info"),
    eventData: jsonb("event_data"),
    isRead: boolean("is_read").default(false),
    resourceId: text("resource_id"),
    resourceType: text("resource_type"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("notification_userId_idx").on(table.userId)],
);

export const userNotificationPreferenceTable = pgTable(
  "user_notification_preference",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    emailEnabled: boolean("email_enabled").default(false).notNull(),
    ntfyEnabled: boolean("ntfy_enabled").default(false).notNull(),
    ntfyServerUrl: text("ntfy_server_url"),
    ntfyTopic: text("ntfy_topic"),
    ntfyToken: text("ntfy_token"),
    gotifyEnabled: boolean("gotify_enabled").default(false).notNull(),
    gotifyServerUrl: text("gotify_server_url"),
    gotifyToken: text("gotify_token"),
    webhookEnabled: boolean("webhook_enabled").default(false).notNull(),
    webhookUrl: text("webhook_url"),
    webhookSecret: text("webhook_secret"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

export const userNotificationWorkspaceRuleTable = pgTable(
  "user_notification_workspace_rule",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    isActive: boolean("is_active").default(true).notNull(),
    emailEnabled: boolean("email_enabled").default(false).notNull(),
    ntfyEnabled: boolean("ntfy_enabled").default(false).notNull(),
    gotifyEnabled: boolean("gotify_enabled").default(false).notNull(),
    webhookEnabled: boolean("webhook_enabled").default(false).notNull(),
    projectMode: text("project_mode").default("all").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_notification_workspace_rule_userId_idx").on(table.userId),
    index("user_notification_workspace_rule_workspaceId_idx").on(
      table.workspaceId,
    ),
    unique("user_notification_workspace_rule_user_workspace_unique").on(
      table.userId,
      table.workspaceId,
    ),
    unique("user_notification_workspace_rule_workspace_id_id_unique").on(
      table.workspaceId,
      table.id,
    ),
  ],
);

export const userNotificationWorkspaceProjectTable = pgTable(
  "user_notification_workspace_project",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    workspaceRuleId: text("workspace_rule_id").notNull(),
    projectId: text("project_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.workspaceId, table.workspaceRuleId],
      foreignColumns: [
        userNotificationWorkspaceRuleTable.workspaceId,
        userNotificationWorkspaceRuleTable.id,
      ],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.workspaceId, table.projectId],
      foreignColumns: [projectTable.workspaceId, projectTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("user_notification_workspace_project_ruleId_idx").on(
      table.workspaceRuleId,
    ),
    index("user_notification_workspace_project_projectId_idx").on(
      table.projectId,
    ),
    index("user_notification_workspace_project_workspaceId_projectId_idx").on(
      table.workspaceId,
      table.projectId,
    ),
    index("unwp_workspaceId_workspaceRuleId_idx").on(
      table.workspaceId,
      table.workspaceRuleId,
    ),
    unique("user_notification_workspace_project_rule_project_unique").on(
      table.workspaceRuleId,
      table.projectId,
    ),
  ],
);

export const githubIntegrationTable = pgTable("github_integration", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .unique(),
  repositoryOwner: text("repository_owner").notNull(),
  repositoryName: text("repository_name").notNull(),
  installationId: integer("installation_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const integrationTable = pgTable(
  "integration",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: text("type").notNull(),
    config: text("config").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("integration_projectId_idx").on(table.projectId),
    index("integration_type_idx").on(table.type),
    unique("integration_project_type_unique").on(table.projectId, table.type),
  ],
);

export const externalLinkTable = pgTable(
  "external_link",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    integrationId: text("integration_id")
      .notNull()
      .references(() => integrationTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    resourceType: text("resource_type").notNull(),
    externalId: text("external_id").notNull(),
    url: text("url").notNull(),
    title: text("title"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("external_link_taskId_idx").on(table.taskId),
    index("external_link_integrationId_idx").on(table.integrationId),
    index("external_link_externalId_idx").on(table.externalId),
    index("external_link_resourceType_idx").on(table.resourceType),
  ],
);

export const commentTable = pgTable(
  "comment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("comment_task_idx").on(table.taskId),
    index("comment_user_idx").on(table.userId),
  ],
);

export const taskRelationTable = pgTable(
  "task_relation",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    sourceTaskId: text("source_task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    targetTaskId: text("target_task_id")
      .notNull()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    relationType: text("relation_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("task_relation_source_idx").on(table.sourceTaskId),
    index("task_relation_target_idx").on(table.targetTaskId),
  ],
);

export const apikeyTable = pgTable(
  "apikey",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    configId: text("config_id").default("default").notNull(),
    name: text("name"),
    start: text("start"),
    referenceId: text("reference_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    prefix: text("prefix"),
    key: text("key").notNull(),
    userId: text("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at", { mode: "date" }),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
    rateLimitMax: integer("rate_limit_max").default(10),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request", { mode: "date" }),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => [
    index("apikey_configId_idx").on(table.configId),
    index("apikey_key_idx").on(table.key),
    index("apikey_referenceId_idx").on(table.referenceId),
    index("apikey_userId_idx").on(table.userId),
  ],
);

export const deviceCodeTable = pgTable(
  "device_code",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    deviceCode: text("device_code").notNull(),
    userCode: text("user_code").notNull(),
    userId: text("user_id").references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    status: text("status").notNull(),
    lastPolledAt: timestamp("last_polled_at", { mode: "date" }),
    pollingInterval: integer("polling_interval"),
    clientId: text("client_id"),
    scope: text("scope"),
  },
  (table) => [
    uniqueIndex("device_code_device_code_uidx").on(table.deviceCode),
    uniqueIndex("device_code_user_code_uidx").on(table.userCode),
    index("device_code_user_id_idx").on(table.userId),
  ],
);

// =====================================================================
// ESJ — Acero estructural (medición de tiempos para cotización)
// Jerarquía de negocio: project → esj_area → esj_phase → esj_piece.
// Las tablas son satélite del core de kaneo para no alterar su modelo.
// =====================================================================

export const esjProjectTable = pgTable(
  "esj_project",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .unique()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    sapCode: text("sap_code").notNull().unique(),
    name: text("name").notNull(),
    clientName: text("client_name").notNull(),
    requester: text("requester"),
    requiredDate: timestamp("required_date", { mode: "date" }),
    priority: text("priority").notNull().default("medium"),
    designType: text("design_type"),
    designOrigin: text("design_origin").notNull().default("esj"),
    totalTonnage: numeric("total_tonnage", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    connectionDate: timestamp("connection_date", { mode: "date" }),
    submittalDate: timestamp("submittal_date", { mode: "date" }),
    status: text("status").notNull().default("pendiente"),
    source: text("source").notNull().default("sap-email"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_project_workspaceId_idx").on(table.workspaceId),
    index("esj_project_status_idx").on(table.status),
    index("esj_project_designType_idx").on(table.designType),
  ],
);

export const esjAreaTable = pgTable(
  "esj_area",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    esjProjectId: text("esj_project_id")
      .notNull()
      .references(() => esjProjectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    code: text("code"),
    tonnage: numeric("tonnage", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_area_projectId_idx").on(table.projectId),
    index("esj_area_esjProjectId_idx").on(table.esjProjectId),
    unique("esj_area_esjProject_name_unique").on(table.esjProjectId, table.name),
  ],
);

export const esjPhaseTable = pgTable(
  "esj_phase",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    esjProjectId: text("esj_project_id")
      .notNull()
      .references(() => esjProjectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    areaId: text("area_id").references(() => esjAreaTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sequence: integer("sequence").notNull().default(0),
    status: text("status").notNull().default("pending"),
    dueDate: timestamp("due_date", { mode: "date" }),
    startedAt: timestamp("started_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_phase_projectId_idx").on(table.projectId),
    index("esj_phase_esjProjectId_idx").on(table.esjProjectId),
    index("esj_phase_areaId_idx").on(table.areaId),
    index("esj_phase_status_idx").on(table.status),
  ],
);

export const esjPieceTable = pgTable(
  "esj_piece",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    esjProjectId: text("esj_project_id")
      .notNull()
      .references(() => esjProjectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    phaseId: text("phase_id").references(() => esjPhaseTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    areaId: text("area_id").references(() => esjAreaTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    code: text("code").notNull(),
    description: text("description"),
    pieceType: text("piece_type"),
    quantity: integer("quantity").notNull().default(1),
    weight: numeric("weight", { precision: 12, scale: 3 }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_piece_projectId_idx").on(table.projectId),
    index("esj_piece_esjProjectId_idx").on(table.esjProjectId),
    index("esj_piece_phaseId_idx").on(table.phaseId),
    index("esj_piece_areaId_idx").on(table.areaId),
  ],
);

export const esjTaskLinkTable = pgTable(
  "esj_task_link",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    taskId: text("task_id")
      .notNull()
      .unique()
      .references(() => taskTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    esjProjectId: text("esj_project_id")
      .notNull()
      .references(() => esjProjectTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    phaseId: text("phase_id").references(() => esjPhaseTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    areaId: text("area_id").references(() => esjAreaTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    pieceId: text("piece_id").references(() => esjPieceTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    roleKey: text("role_key"),
    activityNumber: integer("activity_number"),
    stage: text("stage"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_task_link_esjProjectId_idx").on(table.esjProjectId),
    index("esj_task_link_phaseId_idx").on(table.phaseId),
    index("esj_task_link_areaId_idx").on(table.areaId),
    index("esj_task_link_pieceId_idx").on(table.pieceId),
    index("esj_task_link_roleKey_idx").on(table.roleKey),
    index("esj_task_link_stage_idx").on(table.stage),
  ],
);

export const esjRoleAssignmentTable = pgTable(
  "esj_role_assignment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roleKey: text("role_key").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_role_assignment_workspaceId_idx").on(table.workspaceId),
    index("esj_role_assignment_userId_idx").on(table.userId),
    index("esj_role_assignment_roleKey_idx").on(table.roleKey),
    unique("esj_role_assignment_workspace_user_role_unique").on(
      table.workspaceId,
      table.userId,
      table.roleKey,
    ),
  ],
);

export const esjSapIntakeTable = pgTable(
  "esj_sap_intake",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    sapCode: text("sap_code").notNull().unique(),
    workspaceId: text("workspace_id").references(() => workspaceTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    rawPayload: text("raw_payload").notNull(),
    parsedData: jsonb("parsed_data"),
    status: text("status").notNull().default("received"),
    error: text("error"),
    projectId: text("project_id").references(() => projectTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    esjProjectId: text("esj_project_id").references(() => esjProjectTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("esj_sap_intake_workspaceId_idx").on(table.workspaceId),
    index("esj_sap_intake_status_idx").on(table.status),
  ],
);

// Auth-schema compatible aliases in schema.ts
export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;
export const workspace = workspaceTable;
export const team = teamTable;
export const teamMember = teamMemberTable;
export const workspace_member = workspaceUserTable;
export const invitation = invitationTable;
export const organizationRole = workspaceRoleTable;
export const apikey = apikeyTable;
export const deviceCode = deviceCodeTable;

// Auth-schema compatible relation exports in schema.ts
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  teamMembers: many(teamMember),
  workspace_members: many(workspace_member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const workspaceRelations = relations(workspace, ({ many }) => ({
  teams: many(team),
  workspace_members: many(workspace_member),
  invitations: many(invitation),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [team.workspaceId],
    references: [workspace.id],
  }),
  teamMembers: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}));

export const workspace_memberRelations = relations(
  workspace_member,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspace_member.workspaceId],
      references: [workspace.id],
    }),
    user: one(user, {
      fields: [workspace_member.userId],
      references: [user.id],
    }),
  }),
);

export const invitationRelations = relations(invitation, ({ one }) => ({
  workspace: one(workspace, {
    fields: [invitation.workspaceId],
    references: [workspace.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const organizationRoleRelations = relations(
  organizationRole,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [organizationRole.workspaceId],
      references: [workspace.id],
    }),
  }),
);
