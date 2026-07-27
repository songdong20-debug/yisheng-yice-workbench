import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

async function ensureSchema() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS workspaces (
      owner_email TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema();
  const row = await env.DB.prepare(
    "SELECT payload, updated_at FROM workspaces WHERE owner_email = ?",
  ).bind(user.email).first<{ payload: string; updated_at: string }>();
  if (!row) return Response.json({ students: [], tasks: [], updatedAt: null });
  return Response.json({ ...JSON.parse(row.payload), updatedAt: row.updated_at });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { students?: unknown[]; tasks?: unknown[] };
  if (!Array.isArray(body.students) || !Array.isArray(body.tasks)) {
    return Response.json({ error: "Invalid workspace data" }, { status: 400 });
  }
  await ensureSchema();
  await env.DB.prepare(`
    INSERT INTO workspaces (owner_email, payload, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(owner_email) DO UPDATE SET
      payload = excluded.payload,
      updated_at = CURRENT_TIMESTAMP
  `).bind(user.email, JSON.stringify({ students: body.students, tasks: body.tasks })).run();
  return Response.json({ ok: true });
}
