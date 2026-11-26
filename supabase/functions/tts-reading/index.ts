import { createClient } from "npm:@supabase/supabase-js@2";
// tts-reading: gera o audio (Listening) de 1 reading do Workbook por chamada. Pega 1 linha pendente de reading_audio, monta o roteiro
// (narrador + falas entre aspas), chama Gemini TTS e grava o WAV no bucket 'audio'. Sem entrada do chamador.
// Ordem: prio (menor primeiro), depois lesson; status 'hold' fica fora da fila.
// quote_voices (opcional): voz de cada fala entre aspas, na ordem; sem ela, todas as falas usam voice_b.
// O Gemini aceita no maximo 2 vozes por pedido: com 3 vozes o texto e gravado em partes e os audios sao juntados.
const MODEL = Deno.env.get("GEMINI_TTS_MODEL") || "gemini-2.5-flash-preview-tts";
const H = { "content-type": "application/json" };
const RATE = 24000;
function wav(pcm: Uint8Array, rate = RATE) {
  const h = new ArrayBuffer(44), v = new DataView(h), s = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + pcm.length, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, pcm.length, true);
  const o = new Uint8Array(44 + pcm.length); o.set(new Uint8Array(h), 0); o.set(pcm, 44); return o;
}
type Part = { sp: string; tx: string; v: string };
function script(text: string, va: string, vb: string, qv: string[]) {
  const t = text.replace(/\s+/g, " ").trim();
  const parts: Part[] = [];
  const rx = /“([^”]+)”|"([^"]+)"/g;
  let last = 0, q = 0, m: RegExpExecArray | null;
  while ((m = rx.exec(t))) {
    const before = t.slice(last, m.index).trim();
    if (before) parts.push({ sp: "Narrator", tx: before, v: va });
    const v = qv[q++] || vb;
    parts.push({ sp: v === va ? "Narrator" : "Character", tx: (m[1] || m[2]).trim(), v });
    last = rx.lastIndex;
  }
  const rest = t.slice(last).trim();
  if (rest) parts.push({ sp: "Narrator", tx: rest, v: va });
  const merged: Part[] = [];
  for (const p of parts) { const l = merged[merged.length - 1]; if (l && l.v === p.v) l.tx += " " + p.tx; else merged.push({ ...p }); }
  return merged;
}
// corta o roteiro em trechos com no maximo 2 vozes cada
function segments(sc: Part[]) {
  const out: Part[][] = []; let cur: Part[] = [], vs = new Set<string>();
  for (const p of sc) {
    if (!vs.has(p.v) && vs.size === 2) { out.push(cur); cur = []; vs = new Set(); }
    cur.push(p); vs.add(p.v);
  }
  if (cur.length) out.push(cur);
  return out;
}
async function tts(key: string, seg: Part[], va: string, style: string): Promise<{ pcm?: Uint8Array; err?: string; quota?: boolean }> {
  const voices = [...new Set(seg.map((p) => p.v))];
  const body: any = { generationConfig: { responseModalities: ["AUDIO"] } };
  if (voices.length === 1) {
    body.contents = [{ parts: [{ text: `Read this aloud ${style}: ` + seg.map((p) => p.tx).join(" ") }] }];
    body.generationConfig.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voices[0] } } };
  } else {
    const label = (v: string) => v === va ? "Narrator" : (v === voices.find((x) => x !== va) ? "Character" : "Character2");
    const names = voices.map(label);
    body.contents = [{ parts: [{ text: `TTS the following reading between ${names.join(" and ")}, ${style}. Read only the words after each name:\n` + seg.map((p) => `${label(p.v)}: ${p.tx}`).join("\n") }] }];
    body.generationConfig.speechConfig = { multiSpeakerVoiceConfig: { speakerVoiceConfigs: voices.map((v) => ({ speaker: label(v), voiceConfig: { prebuiltVoiceConfig: { voiceName: v } } })) } };
  }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text(); return { quota: r.status === 429, err: r.status + " " + t.replace(/\s+/g, " ").slice(0, 600) }; }
  const jj = await r.json();
  const d = jj?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!d) return { err: "sem audio " + JSON.stringify(jj).slice(0, 200) };
  return { pcm: Uint8Array.from(atob(d), (ch) => ch.charCodeAt(0)) };
}
Deno.serve(async () => {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return new Response(JSON.stringify({ error: "no-key" }), { headers: H });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: rows } = await sb.from("reading_audio").select("lesson,sec,accent,voice_a,voice_b,quote_voices,path").in("status", ["pending", "error"]).order("status", { ascending: false }).order("prio").order("lesson").limit(1);
  if (!rows || !rows.length) return new Response(JSON.stringify({ left: 0 }), { headers: H });
  const j = rows[0];
  const log = (m: any) => sb.from("reading_log").insert({ msg: { lesson: j.lesson, sec: j.sec, ...m } });
  let err = "", quota = false;
  try {
    const { data: c } = await sb.from("content").select("body").eq("kind", "ex").eq("lesson", j.lesson).single();
    const text: string = c?.body?.wb?.[j.sec]?.text || "";
    if (!text) throw new Error("sem texto");
    const sc = script(text, j.voice_a, j.voice_b || j.voice_a, j.quote_voices || []);
    const style = `in a ${j.accent} accent, clearly and slowly, at a calm pace, like a teacher reading a short text aloud for English learners`;
    const segs = segments(sc), chunks: Uint8Array[] = [];
    for (const s of segs) {
      const t = await tts(key, s, j.voice_a, style);
      if (!t.pcm) { err = t.err || "erro"; quota = !!t.quota; break; }
      chunks.push(t.pcm);
    }
    if (!err) {
      const gap = new Uint8Array(Math.round(RATE * 0.3) * 2);
      const total = chunks.reduce((n, x) => n + x.length, 0) + gap.length * (chunks.length - 1);
      const pcm = new Uint8Array(total); let o = 0;
      chunks.forEach((x, i) => { if (i) { pcm.set(gap, o); o += gap.length; } pcm.set(x, o); o += x.length; });
      const up = await sb.storage.from("audio").upload(j.path, wav(pcm), { contentType: "audio/wav", upsert: true });
      if (up.error) err = up.error.message;
      else {
        const multi = new Set(sc.map((p) => p.v)).size > 1;
        await sb.from("reading_audio").update({ status: "done", err: null, script: sc, updated_at: new Date().toISOString() }).eq("lesson", j.lesson).eq("sec", j.sec);
        await log({ ok: 1, multi, parts: segs.length, secs: +(pcm.length / 2 / RATE).toFixed(1) });
        return new Response(JSON.stringify({ p: j.path, ok: 1, multi, parts: segs.length }), { headers: H });
      }
    }
  } catch (e) { err = String((e as Error).message || e).slice(0, 300); }
  await sb.from("reading_audio").update({ status: quota ? "pending" : "error", err, updated_at: new Date().toISOString() }).eq("lesson", j.lesson).eq("sec", j.sec);
  await log({ err, quota });
  return new Response(JSON.stringify({ p: j.path, err, quota }), { headers: H });
});
