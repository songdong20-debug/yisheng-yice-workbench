"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Workbench from "./Workbench";
import { supabase } from "./supabase";

type Workspace = { students: unknown[]; tasks: unknown[] };

export default function SupabaseApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup" && !result.data.session) setMessage("注册成功，请打开邮箱完成验证后再登录。");
  }

  const loadWorkspace = useCallback(async (): Promise<Workspace | null> => {
    if (!session) return null;
    const { data, error } = await supabase.from("workspaces").select("payload").eq("user_id", session.user.id).maybeSingle();
    if (error) throw error;
    return (data?.payload as Workspace | undefined) ?? null;
  }, [session]);

  const saveWorkspace = useCallback(async (workspace: Workspace) => {
    if (!session) return;
    const { error } = await supabase.from("workspaces").upsert({
      user_id: session.user.id,
      payload: workspace,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (!url.endsWith("/api/workspace")) return originalFetch(input, init);
      if ((init?.method ?? "GET").toUpperCase() === "PUT") {
        await saveWorkspace(JSON.parse(String(init?.body ?? "{}")) as Workspace);
        return Response.json({ ok: true });
      }
      const workspace = await loadWorkspace();
      return Response.json(workspace ?? { students: [], tasks: [], updatedAt: null });
    };
    const interceptSignOut = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/signout-with-chatgpt"]');
      if (!link) return;
      event.preventDefault();
      void supabase.auth.signOut();
    };
    document.addEventListener("click", interceptSignOut);
    return () => {
      window.fetch = originalFetch;
      document.removeEventListener("click", interceptSignOut);
    };
  }, [session, loadWorkspace, saveWorkspace]);

  if (checking) return <main className="authPage"><div className="authCard"><p>正在连接云端数据…</p></div></main>;

  if (!session) {
    return (
      <main className="authPage">
        <section className="authCard">
          <span className="authMark">策</span>
          <p className="eyebrow">STUDENT GROWTH OS</p>
          <h1>一生一策智慧工作台</h1>
          <p className="authIntro">登录后，手机与电脑将使用同一份学生档案和任务数据。</p>
          <form onSubmit={submit}>
            <label>邮箱<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
            {message && <p className="authMessage">{message}</p>}
            <button className="primaryBtn authSubmit" disabled={submitting}>{submitting ? "请稍候…" : mode === "signin" ? "登录工作台" : "创建账号"}</button>
          </form>
          <button className="authSwitch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>
            {mode === "signin" ? "没有账号？立即注册" : "已有账号？返回登录"}
          </button>
        </section>
      </main>
    );
  }

  return <Workbench userName={session.user.email ?? "已登录用户"} />;
}
