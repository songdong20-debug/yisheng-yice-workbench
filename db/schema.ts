import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workspaces = sqliteTable("workspaces", {
  ownerEmail: text("owner_email").primaryKey().notNull(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull(),
});

