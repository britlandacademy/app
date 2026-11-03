// swift-worker (projeto de espanhol; mesmo código da super-processor com URLs /app/espanol/): envia as notificações push (aluno e professor). Deploy com "Verify JWT" DESLIGADO como já está (chamada pelo agendamento).
// Modos (POST {mode}): (vazio) lembretes por hora | "teacher" avisos ao professor e mensagens avulsas | "student" avisos programados dos alunos
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") || "mailto:pscenesp@gmail.com",
  Deno.env.get("VAPID_PUBLIC")!,
  Deno.env.get("VAPID_PRIVATE")!,
);

const pick = (a: string[], seed: number) => a[seed % a.length];
const IDLE = [
  (n: string) => `${n}, alguns minutos de estudo hoje mantêm sua sequência viva 🔥`,
  (n: string) => `Oi, ${n}! Seu leão está esperando você 🦁 Vamos fazer um exercício rápido?`,
  (n: string) => `${n}, pequenos passos todos os dias fazem grande diferença. Vamos praticar!`,
  (n: string) => `Vamos lá, ${n}! 5 minutos já bastam. Você consegue 💪`,
];
const MISS = [
  (n: string) => `${n}, sentimos sua falta! Volte e continue de onde parou 🦁`,
  (n: string) => `Oi, ${n}! Seu curso continua aqui esperando você. Que tal um exercício hoje?`,
];
function build(r: any) {
  const n = r.first_name || "aluno", s = (r.days || 0) + n.length;
  const T = "Britland Academy";
  switch (r.kind) {
    case "idle": return { title: T, body: ((r.days || 0) >= 7 ? pick(MISS, s) : pick(IDLE, s))(n), url: "/app/espanol/" };
    case "exam": return { title: T, body: `${n}, sua prova já está disponível. Boa sorte! 🍀`, url: "/app/espanol/" };
    case "grade": return { title: T, body: `${n}, o resultado da sua prova saiu. Venha ver! 🎉`, url: "/app/espanol/" };
    case "lesson1h": return { title: T, body: `${n}, sua aula começa em 1 hora (${r.info}). Até já! 🦁`, url: "/app/espanol/", tag: "lesson" };
    case "lessonday": return { title: T, body: `Lembrete: você tem aula amanhã às ${r.info}.`, url: "/app/espanol/", tag: "lesson" };
    case "birthday": return { title: T, body: `Feliz aniversário, ${n}! 🎂🦁`, url: "/app/espanol/" };
    case "streak": return { title: T, body: `${n}, sua sequência de ${r.info} dias termina hoje à noite! 5 minutos bastam 🔥`, url: "/app/espanol/" };
    case "newlesson": return { title: T, body: `Nova lição liberada: Lição ${r.info} 🎉`, url: "/app/espanol/" };
    default: return { title: T, body: `${n}, lembrete: sua mensalidade vence em 2 dias. Você já enviou o comprovante de pagamento para o professor?`, url: "/app/espanol/" };
  }
}

async function send(r: any, payload: any, ttl = 3600) {
  try {
    await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(payload), { TTL: ttl });
    return 1;
  } catch (e: any) {
    if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", r.endpoint);
    return 0;
  }
}
const out = (o: unknown) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });

// grava no notif_log o que foi enviado (uma vez por aluno/tipo/ref)
async function logSent(rows: any[], sentFlags: number[]) {
  const logged = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], k = r.user_id + "|" + r.kind + "|" + r.ref;
    if (sentFlags[i] && !logged.has(k)) { logged.add(k); await sb.from("notif_log").insert({ user_id: r.user_id, kind: r.kind, ref: r.ref }); }
  }
}

// ---- e-mail de feliz aniversário (visual A do livro de estilo). Só roda se o segredo SMTP_PASS existir. ----
// Segredos: SMTP_USER, SMTP_PASS (senha de app do Gmail), MAIL_FROM (ex.: Britland Academy <contact@britlandacademy.co.uk>), MAIL_LANG (pt no inglês; es no espanhol).
const SHIELD = "https://www.britlandacademy.co.uk/app/img/britland-shield.png";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
function birthdayMail(name: string, lang: string) {
  const es = lang === "es", n = esc(name || (es ? "alumno" : "aluno"));
  const T = es
    ? { sub: name ? `¡Feliz cumpleaños, ${name}!` : "¡Feliz cumpleaños!", h: `¡Feliz cumpleaños, ${n}!`, e: "Feliz aniversário!", p1: "Hoy es tu día. Que tu nuevo año llegue con salud, alegría y muchos logros, también en el español.", p2: "¡Mira cuánto ya hablas! Gracias por aprender con nosotros. Sigue así, sin prisa y sin vergüenza.", ab: "Un abrazo," }
    : { sub: name ? `Feliz aniversário, ${name}!` : "Feliz aniversário!", h: `Feliz aniversário, ${n}!`, e: "Happy birthday!", p1: "Hoje o dia é seu. Que seu novo ano venha com saúde, alegria e muitas conquistas, inclusive no inglês.", p2: "Olha o quanto você já fala! Obrigado por aprender com a gente. Continue assim, sem pressa e sem vergonha.", ab: "Um abraço," };
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EFE9D9"><tr><td align="center" style="padding:20px 10px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAF8F3" style="width:100%;max-width:560px;border-radius:6px;overflow:hidden"><tr><td bgcolor="#0B1733" style="padding:22px 30px;border-bottom:4px solid #C9A13B"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:14px"><img src="${SHIELD}" width="48" alt="Britland Academy" style="display:block;border:0"></td><td style="font-family:Georgia,serif;color:#F2F5FA"><div style="font-size:21px;font-weight:bold;letter-spacing:2px">BRITLAND</div><div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:5px;color:#EC4654;font-weight:bold">ACADEMY</div></td></tr></table></td></tr><tr><td style="padding:30px 30px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#17202F"><div style="font-family:Georgia,serif;font-size:26px;line-height:1.2;font-weight:bold;color:#0B1733;margin:0 0 6px">${T.h}</div><div style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#B3202A;margin:0 0 18px">${T.e}</div><p style="margin:0 0 14px">${T.p1}</p><p style="margin:0 0 14px">${T.p2}</p><p style="margin:0 0 6px">${T.ab}</p></td></tr><tr><td style="padding:14px 30px 26px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#17202F"><div style="border-top:1px solid #d9d2bf;padding-top:14px"><div style="font-family:Georgia,serif;font-weight:bold;font-size:16px;color:#0B1733">Paulo Sérgio Cruz</div><div style="color:#5A6577">Britland Academy · ${es ? "Inglés y español 100% online" : "Inglês e espanhol 100% online"}</div></div></td></tr><tr><td bgcolor="#0B1733" style="padding:14px 30px;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#B4BFD6;text-align:center">Britland Academy · Cruz e Trento Cursos de Idiomas · Franca, SP</td></tr></table></td></tr></table>`;
  return { subject: T.sub, html, text: `${T.h}\n${T.e}\n\n${T.p1}\n${T.p2}\n\n${T.ab}\nPaulo Sérgio Cruz · Britland Academy` };
}
async function sendBirthdayEmails() {
  const pass = Deno.env.get("SMTP_PASS"), user = Deno.env.get("SMTP_USER");
  if (!pass || !user) return { skipped: "sem SMTP_PASS" };
  const { data, error } = await sb.rpc("due_birthday_emails");
  if (error) return { error: error.message };
  const rows = data || [];
  if (!rows.length) return { due: 0, sent: 0 };
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts"); // import só quando há e-mail a enviar: nunca derruba as notificações push
  const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
  let sent = 0;
  const year = String(new Date(Date.now() - 3 * 3600_000).getUTCFullYear());
  for (const r of rows) {
    try {
      const m = birthdayMail(r.first_name, Deno.env.get("MAIL_LANG") || "pt");
      await client.send({ from: Deno.env.get("MAIL_FROM") || user, to: r.email, subject: m.subject, content: m.text, html: m.html });
      await sb.from("notif_log").insert({ user_id: r.user_id, kind: "birthday_email", ref: year });
      sent++;
    } catch (_e) { /* tenta de novo na próxima rodada */ }
  }
  try { await client.close(); } catch (_e) { /* ignora */ }
  return { due: rows.length, sent };
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));

  if (body.mode === "teacher") {
    const { data, error } = await sb.rpc("take_teacher_events");
    if (error) return new Response(error.message, { status: 500 });
    let sent = 0;
    for (const r of data || []) {
      const msg = r.kind === "pay" ? `${r.student}: pagamento registrado 💰`
        : r.kind === "msg" ? r.label
        : `${r.student} concluiu ${r.label} ✅`;
      sent += await send(r, { title: "Britland Academy", body: msg, url: "/app/espanol/admin.html", tag: "teacher-" + (r.kind === "msg" ? r.label : r.student), silent: !!r.night });
    }
    // mensagens avulsas para alunos (pedido aprovado/recusado, aula remarcada/cancelada)
    let msgs = 0;
    const sm = await sb.rpc("take_student_msgs");
    for (const r of sm.data || []) msgs += await send(r, { title: "Britland Academy", body: r.mbody, url: r.murl || "/app/espanol/", tag: "msg-" + r.mid }, 86400);
    return out({ events: (data || []).length, sent, msgs, msgErr: sm.error?.message || null });
  }

  if (body.mode === "student") {
    const { data, error } = await sb.rpc("due_student_events");
    if (error) return new Response(error.message, { status: 500 });
    const rows = data || [], flags: number[] = [];
    for (const r of rows) flags.push(await send(r, build(r), r.kind === "lesson1h" ? 3000 : 3600));
    await logSent(rows, flags);
    let mail: unknown = null;
    try { mail = await sendBirthdayEmails(); } catch (e) { mail = { error: String(e) }; }
    return out({ due: rows.length, sent: flags.reduce((a, b) => a + b, 0), mail });
  }

  const { data, error } = await sb.rpc("due_reminders");
  if (error) return new Response(error.message, { status: 500 });
  const rows = data || [], flags: number[] = [];
  for (const r of rows) flags.push(await send(r, build(r)));
  await logSent(rows, flags);
  let ranks = 0;
  const rk = await sb.rpc("rank_events");
  const seen = new Set<string>();
  for (const r of rk.data || []) {
    const ok = await send(r, { title: "Britland Academy", body: r.passer + " acabou de passar você no ranking de sequência 🦁 Hora de correr atrás!", url: "/app/espanol/", tag: "rank" });
    ranks += ok;
    if (ok && !seen.has(r.user_id)) { seen.add(r.user_id); await sb.from("notif_log").insert({ user_id: r.user_id, kind: "rank", ref: "" }); }
  }
  return out({ due: rows.length, sent: flags.reduce((a, b) => a + b, 0), ranks, rankErr: rk.error?.message || null });
});
