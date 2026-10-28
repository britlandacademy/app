// super-processor: envia as notificações push (aluno e professor). Deploy com "Verify JWT" DESLIGADO como já está (chamada pelo agendamento).
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
    case "idle": return { title: T, body: ((r.days || 0) >= 7 ? pick(MISS, s) : pick(IDLE, s))(n), url: "/app/" };
    case "exam": return { title: T, body: `${n}, sua prova já está disponível. Boa sorte! 🍀`, url: "/app/" };
    case "grade": return { title: T, body: `${n}, o resultado da sua prova saiu. Venha ver! 🎉`, url: "/app/" };
    case "lesson1h": return { title: T, body: `${n}, sua aula começa em 1 hora (${r.info}). Até já! 🦁`, url: "/app/", tag: "lesson" };
    case "lessonday": return { title: T, body: `Lembrete: você tem aula amanhã às ${r.info}.`, url: "/app/", tag: "lesson" };
    case "birthday": return { title: T, body: `Feliz aniversário, ${n}! 🎂🦁`, url: "/app/" };
    case "streak": return { title: T, body: `${n}, sua sequência de ${r.info} dias termina hoje à noite! 5 minutos bastam 🔥`, url: "/app/" };
    case "newlesson": return { title: T, body: `Nova lição liberada: Lição ${r.info} 🎉`, url: "/app/" };
    default: return { title: T, body: `${n}, lembrete: sua mensalidade vence em 2 dias. Você já enviou o comprovante de pagamento para o professor?`, url: "/app/" };
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
      sent += await send(r, { title: "Britland Academy", body: msg, url: "/app/admin.html", tag: "teacher-" + (r.kind === "msg" ? r.label : r.student), silent: !!r.night });
    }
    // mensagens avulsas para alunos (pedido aprovado/recusado, aula remarcada/cancelada)
    let msgs = 0;
    const sm = await sb.rpc("take_student_msgs");
    for (const r of sm.data || []) msgs += await send(r, { title: "Britland Academy", body: r.mbody, url: r.murl || "/app/", tag: "msg-" + r.mid }, 86400);
    return out({ events: (data || []).length, sent, msgs, msgErr: sm.error?.message || null });
  }

  if (body.mode === "student") {
    const { data, error } = await sb.rpc("due_student_events");
    if (error) return new Response(error.message, { status: 500 });
    const rows = data || [], flags: number[] = [];
    for (const r of rows) flags.push(await send(r, build(r), r.kind === "lesson1h" ? 3000 : 3600));
    await logSent(rows, flags);
    return out({ due: rows.length, sent: flags.reduce((a, b) => a + b, 0) });
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
    const ok = await send(r, { title: "Britland Academy", body: r.passer + " acabou de passar você no ranking de sequência 🦁 Hora de correr atrás!", url: "/app/", tag: "rank" });
    ranks += ok;
    if (ok && !seen.has(r.user_id)) { seen.add(r.user_id); await sb.from("notif_log").insert({ user_id: r.user_id, kind: "rank", ref: "" }); }
  }
  return out({ due: rows.length, sent: flags.reduce((a, b) => a + b, 0), ranks, rankErr: rk.error?.message || null });
});
