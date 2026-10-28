// gcal-auth: conecta a agenda do professor (OAuth). Deploy com "Verify JWT" DESLIGADO (o Google chama o retorno sem login).
import { createClient } from "npm:@supabase/supabase-js@2";
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SEC = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const REDIRECT = `${URL_}/functions/v1/gcal-auth`;
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const db = createClient(URL_, KEY, { auth: { persistSession: false } });
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const BACK = Deno.env.get("ADMIN_URL") || "https://britlandacademy.github.io/app/admin.html"; // no projeto de espanhol, defina o segredo ADMIN_URL = https://britlandacademy.github.io/app/espanol/admin.html

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const u = new URL(req.url);

  // 1) Inicio: o admin (logado) pede o endereco de autorizacao do Google
  if (req.method === "POST") {
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: usr } = await db.auth.getUser(jwt);
    if (!usr?.user) return json({ error: "login" }, 401);
    const { data: p } = await db.from("profiles").select("is_admin").eq("id", usr.user.id).maybeSingle();
    if (!p?.is_admin) return json({ error: "forbidden" }, 403);
    const body = await req.json().catch(() => ({}));
    const state = crypto.randomUUID();
    await db.from("gcal_link").upsert({ id: 1, pending_state: state });
    const q = new URLSearchParams({ client_id: CID, redirect_uri: REDIRECT, response_type: "code", scope: SCOPES, access_type: "offline", prompt: "consent", state });
    return json({ url: "https://accounts.google.com/o/oauth2/v2/auth?" + q.toString() });
  }

  // 2) Retorno do Google
  const code = u.searchParams.get("code"), state = u.searchParams.get("state");
  if (!code || !state) return new Response("Faltam parametros.", { status: 400 });
  const { data: row } = await db.from("gcal_link").select("pending_state").eq("id", 1).maybeSingle();
  if (!row || row.pending_state !== state) return new Response("Autorizacao invalida ou expirada. Volte ao admin e tente de novo.", { status: 400 });
  const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: CID, client_secret: SEC, redirect_uri: REDIRECT, grant_type: "authorization_code" }) });
  const t = await tr.json();
  if (!t.refresh_token) return new Response("O Google nao devolveu o acesso permanente. Remova o acesso do app em myaccount.google.com/permissions e tente de novo.", { status: 400 });
  // procura a agenda "Aulas Britland"; se nao existir, usa a principal
  let calId = "primary", calName = "Agenda principal";
  const cl = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", { headers: { Authorization: "Bearer " + t.access_token } });
  if (cl.ok) { const j = await cl.json(); const f = (j.items || []).find((c: any) => /aulas\s*britland/i.test(c.summary || "")); if (f) { calId = f.id; calName = f.summary; } }
  await db.from("gcal_link").upsert({ id: 1, refresh_token: t.refresh_token, calendar_id: calId, calendar_name: calName, pending_state: null, connected_at: new Date().toISOString(), last_error: null });
  return Response.redirect(BACK + "?gcal=ok", 302);
});
