// pay-mail: e-mails de mensalidade (modelo B "Fatura").
//   Aviso: 5 dias antes do vencimento, com o valor em destaque. Em real, se o aluno ja tem cadastro no Asaas (CPF de um pagamento anterior),
//          gera uma cobranca Pix da parcela e poe o QR Code e o copia e cola no e-mail; senao, so o botao para pagar no app.
//   Recibo: quando a parcela fica paga (no app, pelo Pix do e-mail ou baixa manual), envia o recibo com o botao para baixar o PDF no app.
// Roda pelo agendamento (cron pay-mail-hourly), so entre 9h e 19h de Brasilia. Deploy com verify_jwt = false: nao recebe dados,
// so envia o que esta pendente, e cada e-mail e registrado em notif_log (pay_email / paid_email) para nunca repetir.
// Segredos: SMTP_USER, SMTP_PASS, MAIL_FROM (os mesmos do e-mail de aniversario), ASAAS_API_KEY.
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY") || "";
const ASAAS_URL = (Deno.env.get("ASAAS_ENV") || "production") === "sandbox" ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
const SITE = "https://www.britlandacademy.co.uk/app/";
// logo do e-mail no Storage do Supabase (o Gmail nao consegue buscar a imagem no site, que fica atras do Cloudflare)
const SHIELD = Deno.env.get("SUPABASE_URL") + "/storage/v1/object/public/pix-qr/brand/britland-shield-v1.png";
const SHIELD_B64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABwCAMAAADWkIWRAAAAkFBMVEXbsGCkjFwDDl6rGihTWFrZ1dg3R1qSclgVKU8MJ02Zoq4BKT0MJkzUq6nEaWRgcYhlITl5h5rcy6hUKUa7STcVFzyttsO5w8y0NkTEHy0KXF/cvcLKe4bBXT2OeIgAAP9VVVX4xWkNKVEAAADRqFuxGSjl5+kAHEgnOlC0llsZMlLw9fVuaFXcsF3PqWFUV1SgojuzAAAAMHRSTlP//w///////9iW/wZg/////////////////wT/////AQP//gD////////////////zwR7VAAAMRUlEQVR42qVaZ3uzOhKVsChucclN8pZbdmWCQKb8/3+3Z0YCBMaOc1dPPsQ2zNH0IonLoxX9imZfbGmFX+CRKHpAQtwjPby1xb+73W7NK+PF/+K7KNqOz38HoH+aKIOmvr8yAupxFkHErVQG0utHpGc4u3sgYmHrEWjrby8Cif5Dr98DYOrY+r8gHoL8mmKIkPp2N5OKnXywpV/WPgLZRaGoHABTj3aLMi8T1dWplJVssXJaoqoqmaZ1p5JFqHWAITz5Jeo26ZQE2bzJ6W+6BK9WSuCUi7JyEMJr9WbfoF2BbnNDU+S3q5K3KNm65+Bm82WXylZ40k0DwVRyvz+LP4aVns9nKeWI0DRgplZzUTEHM/JJLXNHnHZfkaBLq5OiuL6sPv1arfBxY6B1qEdWreh3U6UzRnYX8Ssb9WRVWjlpO9rJ8LQDGBB+MMDIcU3i9EvWAUa2FdF63HsFrTF1qWY7mXLw+SMOAdwTXepASFidHQEuDsB20luKkAtWMQX4+bMoipO5tWjpjECIyrMxAkgyDpG3+3Pxnpl7AD+PFExfj6tNPOcAyxzi4uUP0QqWQjIFIPba8znG1q6xMssAq2NGDs2b3ZxmTqPt5hqn0NPqD0Jo1Q3Ay4/fV9AvSL6zKMEA6ZuTQ8pqNDMfNiq+7tkMVi/xGdK4ARAQwb5w6/qRzFRYxHihpJChukq0XTK3+dP1uncmvL8WcbsIgF/T2DMRHyYIKi5NmQa+XLehJRgSDza48hTiWxHBu/4i+RE+IxSbiX1kulTkunVZ1i2HDXUrHgjoT5YAABaULJwjuUeKmMQ0U0Sad6YDBB5OZQBwKiCe1eewvWUAcYYNfAZiuhaHIBewkee6biuRSvJzryWrM7ae4E3Y4SIHmyJQk3swsKaSJF9pmRpVOZ9Rg3h+/3DW05vIu1oCaFQyGlrRb6W3JsuemGsltSWfqcAy/zaxHrdOumwX/KCpTTlndrQmJVqKNalJdAooWZpaSBjS8MbL8AbcNFky06bu1cVr2A9bU9m2CoQbesunGAWeOqM3P0LTgFQtdlTmixyQRJNBomlMxhqTmLSuRVlj41VZmySvOSa6wKjfVjPx8H7uArDLFBw3+a3rlawp0YiwRBBRwqg68VmzUQpBg52L9h5EMXr4DgDWAWJihOPhcNiQXK1VRlIwr/IOZlWyp5GqO5D4/GTrid8/EIe90T0GIDH9zYHNYCUf19i/ApqiJutLm7xSVBK0tc1YPJuE3rO9UT8GgJgosJXIQVJCjTEATM2KpYRok0RXTdmJRuR1hyhF9EG9DPJUuegHdRjdUQ5VDWotoUzyDnbSnLZPeq61RNyDu6lageQ7xbYMtlsB7XkABTHDMUAYCIdDCRUgHCrOukrSD7VUdZXrEraG5NaJujRj/E0ei4ieAIDo9JvRQr4drjAjUZMCOG1XOT2aUrGiLZmyRTCGNJPJ648ByFvb0u5fTVrpbA8jEh3sSNfOQkVNmupaaZDqCmUUCi+RKvuAA8kvBTKsKrx3PRgJgJ+vCBWJQjljal96KA2JJ9YgVKg3erzr7OT9+wCIzBb6ha3o5GRtm+pXAHRNSTFCGuV56FIOLeRbnB9KE6TxRR3k+5gXypES4jRv9v0dwRgxc4PvkkqbDruXrP9W5m2dW4Q6ZKXEVfS1PsT9Oi8CnH0qO5TwMOy+QKzuBIn5+mESuDA5QyORGQBUU0IwGzhA1xIuykwYgw9Id1Lm+cpZgMLPx0d8RbbB/qXWH1cushKpKdeIlEUiO4gFmtYkMjyFHdnTFwD7Yf2Of+/3B+NCvor3sCJtUnwwSJmQWUmBOyXwriKlt4lWf+/DtSQikY7FLSLd25tmEq/0wRkGQg+Ms8LGO4iqbCvt4irMI1v9/AzfXgR4CZ/IdFKRXR3dRw5wpEplbMqlbKslFO4Kdq3Dvd0DaAIAEOxEC8E4+jDTpPXlf2copqmmtbWEDdBXpX/seYAVpTCIP/MbO/rq27sY+RjCUIfkg14AxpR9fhMgI/pO/I6+qYfWr6kQahH8BAK6li38zWSrbwIcNZvncVAHZ4Oh10R27kwqyXLTkri5of8VAD6JpFfvK4JHKlw7K1hQiCqpqbu+sNNTA3oCYGUSMJA5WbmGnBuwBvYofZelw0YPT2XHbwAcNcng6O1/zEFpK2QyROtJd1OOCnvkB16Wr5zGVp4BW9qxx5PcaslypGxd6pFTU73naCteBAAOVqvMx/GKJgWuMyNzpdRrqGFHfZpTH0KDAWSN1bAWAZo+XMebNzZSvyrX+4o85ehVt1SgWKRjp/e+0UH9Eo/rvFD8Nn24Lj5M2Yq0BxgGEg2Sih8h1ePwZeikkP6KYS31aA2Fa1e/KvgVI6guAKBgx5VhKYOBCwVSbrqRPItrMTYgNwAi3/j1fqI9pkhsaDhCAFcrlm044mlLo/4LnzAKL26GxcgeYOclQWWQcbWN1aZM9BKAsCadDoyoUaD8T/nJV5t4ewCIRoB8VKxxXfAiAGq8JQBUkPHYW3ccY2lidOkBVABgDtyd3QNoFgDsK9XAQ2+N2FhZN5ISl8h9lfuvNLVFhauo26cB4MjUdnF748pvt13iIOo5cExR8R7HjoNWzgHyOUA7AHDH4sUkuSJwE6/LNnNNGCUrbj+okSuojmCA6jmAI3VSaOyu1ENZ4SpnBzBGu9SJhy35tAxAVrQIoIbudAPD7asWHV1E5LVMYiPxOEc5DVY052Bmph4AduEaux8kJlKoi+QMEA2WdeLGErUdLBm7sst+sMxBUbgmnjq2Nh90HNHc1Ckhb100iq/vCGYknQUzzW8AkgFgaOL3Q8bYMcA4tRNOPinKEYpFCyIS95Ts6lKefNJIzcfAiAB6JVCNAwFdf6+OpKX0jh/c4cABuFkH2kPpZ440+e2VYPH4nicJr96On3G0KQcQMMaCgrovrwIejm/XvR21PBdDQM7Fsxx4AEw52ECK658vvA+vAh6OexmhOmxITa8YMbfiWQ68iHhuNJTuzsvW/fTd2xHREgB4I318GwB59J0Rzn3QYQb8AcW6j0dgIT0gozVt5wGQiZo7AA2WGAAsi4myZZP2XjacgERD/hUYdh2oVKw9QI2GPqUJ/jQWYYyOU5YazX4P4APlvs81jgF/AuJZoLLqTAGx412wH2hOciVAmpEDGrCXLn/pAIBiWZ73BUM0HhKNLJCFYZiZtG0PYPsjJ0vtUsUZrR2OCOjXCYAcNLC+ROEplGOBgjaHqZJKNm7H8xYHQWgiiRM0JZaGCtYYPoeRLZ9IBQC1GCYG0RTAs4BGHvXGMPWBpIk8zjcET8QtSiNFaaOj0yn6BQc8zQiQ9BscGOgP6npf0BhIDM/bukv6yhRHXvUwiyjdJMdVp4mqhykI3vYazqL5UaP3hTKs1ubnanbpgDBYpMJaByY0Ocv0LLh5we2anVmY21MSGpT0Re36csuB1zObYXpzArI5qXDfyWFzmEN2+WBBWXQLgHPBbLS0OUJyvV7To38gO/4orrMzHOt65mQmoAlAb0k0mxZq8ZBodXTdkj+om9BvXelKH9bBsXV4ntwLqcxvEIZjLpd3V3zOY2dDvl7BWXTnRDzyicFN7NIHB3U3AF24p2jpwNrfQAgQJnp4DGAm9HeX6P6lgV7R3E1Kex8gDgG4T+87z/X0UH92aaBXtC75FCLpiSwAnJySMeHjsXZPf/crenTtYQgZQGgobHq3XRDRyfcqCdPvBvl8ca9iROABi/BiuguAtrPpDy5v5bN8M2RAoHFcU6l7SiYRlbR9asPdPtbbf565ejKckbPz56m9Y0WuWOOW2y7LZxkAml4PwwM3hF3mIJH5xCXXz16e2Y4Ijgkh1QJAzf1sWo7n99unb+cEiuC2m+YMEwCUPy3ftujCGwjfuV80IoAJlvQ5vJVw5lPvdtz+evvNC0yXQEzWTS9xXOsB+Mgbo9MkuN5w+S4HUPXIRJm6mQsz4chjoK+/Es8XHIRi0t5i8pe/XI1XBeF8F12ifwEwYwLHpHz/g4WP0miy/X/FgWMiWocQfnIakM92l8dLPP45ukzuvuBMHIP9oHD5YvtfAzATIUSZzG7fRP8fBz3E4j2oJ8g/A3Cjil7420v0Nf2nABhiO7lftt5dntn+0wAOZdAFO1b03FtPA5A4tnQXzF9ze/a9b3DgbrPRlcMoev6l7wD4fX+H/OXyP6k3+HUapgLjAAAAAElFTkSuQmCC";
async function ensureLogo() {
  const bin = Uint8Array.from(atob(SHIELD_B64), (c) => c.charCodeAt(0));
  await sb.storage.from("pix-qr").upload("brand/britland-shield-v1.png", bin, { contentType: "image/png", upsert: false }).catch(() => null);
  const qr = Uint8Array.from(atob(QR_TEST_B64), (c) => c.charCodeAt(0));
  await sb.storage.from("pix-qr").upload("brand/qr-teste-v1.png", qr, { contentType: "image/png", upsert: false }).catch(() => null);
}
// QR Code de exemplo, so para o e-mail de teste (codigo falso, nao paga nada)
const QR_TEST_B64 = "iVBORw0KGgoAAAANSUhEUgAAALQAAAC0AQAAAAAVtjufAAABn0lEQVR42tWYsXHkMBRDHz2bgx2o/7K2A7CC54DrwDMOf3DHQIECkAJAgNSSv8b54u/x771fa+212GdvFmzWWnsQP0p6+sBy7+7o3PpfsEKXq2zO8cDKNG8L8tAEno7y/wKgz/IAmzWvu4V3F9AT2dg5/OWC/PY+5D2Fj6pBWkmIqp3DD0XSWqVN2gzitxRiAG01w/gFG2wjQZnEj1UTYzEJHeXfSO9M6dUjk/gkJeQiE6qT/Njms+xYG+gsfmxitKnUdJKfhjQYaW0is/tLTe4kV4d21j9AqzRGddafpC2kROjNi1H+G9q7bGKH/Z/WVlrQAiSz+CiYcn2UUf4LtUmaUGsczh/ij4UCd59N9ldVDJorwiz/IVZvVKQy3F/alKStiI2z/WUiRNIkldl8JlJ6m93Pc/L8EJJCm5i2k/5/0UMWeOBkA3TJpL4lWCTaQkbzTTW9CtgYJ/vx3l/OE/JsNsCGMtpf+Zw/8/MFmfVPmkSr0SvKLP5HWW+8ZZR/gJxzLwHmvejDMP+fkNaGyOj+BYKJISWlk/2+/vP/A9/maMGtWdaBegAAAABJRU5ErkJggg==";
const QR_TEST = Deno.env.get("SUPABASE_URL") + "/storage/v1/object/public/pix-qr/brand/qr-teste-v1.png";
const START = "2026-11-25"; // recibos so de pagamentos a partir do lancamento (nao manda recibo de pagamentos antigos)

const nowBR = () => new Date(Date.now() - 3 * 3600e3);
const isoBR = (d = nowBR()) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const br = (iso: string) => iso.split("-").reverse().join("/");
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
function money(cur: string, v: number) {
  const [i, d] = Number(v || 0).toFixed(2).split(".");
  return (cur === "BRL" ? "R$ " : "€ ") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + d;
}
const MES = {
  pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

async function asaas(path: string, init: { method?: string; body?: unknown } = {}) {
  const r = await fetch(ASAAS_URL + path, {
    method: init.method || "GET",
    headers: { "access_token": ASAAS_KEY, "content-type": "application/json", "user-agent": "BritlandAcademy" },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j?.errors?.[0]?.description as string) || `asaas ${r.status}`);
  return j;
}

/* ---------- visual (mesmo padrao do e-mail de aniversario) ---------- */
const F = "font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#17202F";
const btn = (t: string, href: string) => `<a href="${href}" style="display:inline-block;background:#C9A13B;color:#0B1733;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;text-decoration:none;padding:13px 28px;border-radius:999px">${t}</a>`;
const big = (lbl: string, val: string, sub: string) => `<div style="text-align:center;margin:0 0 18px"><div style="font-size:12px;letter-spacing:2px;color:#5A6577;font-weight:bold">${lbl}</div><div style="font-family:Georgia,serif;font-size:40px;font-weight:bold;color:#0B1733;line-height:1.2">${val}</div><div style="font-size:14px;color:#5A6577">${sub}</div></div>`;
function rows(rs: [string, string][]) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px">` + rs.map(([a, b]) => `<tr><td style="padding:7px 0;color:#5A6577;border-bottom:1px solid #e6e0cf">${a}</td><td align="right" style="padding:7px 0;border-bottom:1px solid #e6e0cf">${b}</td></tr>`).join("") + `</table>`;
}
function frame(inner: string, es: boolean) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EFE9D9"><tr><td align="center" style="padding:20px 10px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAF8F3" style="width:100%;max-width:560px;border-radius:6px;overflow:hidden"><tr><td bgcolor="#0B1733" style="padding:22px 30px;border-bottom:4px solid #C9A13B"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:14px"><img src="${SHIELD}" width="48" alt="Britland Academy" style="display:block;border:0"></td><td style="font-family:Georgia,serif;color:#F2F5FA"><div style="font-size:21px;font-weight:bold;letter-spacing:2px">BRITLAND</div><div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:5px;color:#EC4654;font-weight:bold">ACADEMY</div></td></tr></table></td></tr><tr><td style="padding:30px 30px 8px;${F}">${inner}</td></tr><tr><td style="padding:14px 30px 26px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#17202F"><div style="border-top:1px solid #d9d2bf;padding-top:14px"><div style="font-family:Georgia,serif;font-weight:bold;font-size:16px;color:#0B1733">Britland Academy</div><div style="color:#5A6577">${es ? "Financiero · Inglés y español 100% online" : "Financeiro · Inglês e espanhol 100% online"}</div></div></td></tr><tr><td bgcolor="#0B1733" style="padding:14px 30px;font-family:Arial,sans-serif;font-size:11px;line-height:1.5;color:#B4BFD6;text-align:center">Britland Academy · Cruz e Trento Cursos de Idiomas · Franca, SP</td></tr></table></td></tr></table>`;
}

type Row = { id: number; sub_id: number; due_date: string; currency: string; amount: number; paid_on: string | null; note: string | null; title: string | null; uid: string; email: string; name: string; course: string; plan: string };

function refOf(r: Row, es: boolean) {
  if (r.title) return r.title;
  const m = MES[es ? "es" : "pt"][Number(r.due_date.slice(5, 7)) - 1];
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${es ? "de" : "de"} ${r.due_date.slice(0, 4)}`;
}

function noticeMail(r: Row, pix: { payload: string; img: string } | null) {
  const es = r.course === "es", first = esc(String(r.name || "").trim().split(/\s+/)[0] || (es ? "alumno" : "aluno"));
  const app = SITE + (es ? "espanol/" : "") + "account.html#payments";
  const val = money(r.currency, r.amount), mes = r.title ? esc(r.title) : MES[es ? "es" : "pt"][Number(r.due_date.slice(5, 7)) - 1];
  const T = es
    ? { sub: `Tu mensualidad de ${mes}: ${val}`, hi: `¡Hola, ${first}! Tu mensualidad de <b>${mes}</b> (${esc(r.plan)}) ya está disponible.`, lbl: "VALOR A PAGAR", due: `vence el ${br(r.due_date)}`, scan: "Abre la app de tu banco y escanea el código QR", cc: "O usa Pix copia y pega:", card: "O paga con tarjeta en la app", only: r.currency === "BRL" ? "Pagar con Pix o tarjeta en la app" : "Pagar en la app", hint: r.currency === "BRL" ? "" : "Tarjeta o Wise, en menos de un minuto.", ign: "Si ya pagaste, puedes ignorar este correo." }
    : { sub: `Sua mensalidade de ${mes}: ${val}`, hi: `Oi, ${first}! Sua mensalidade de <b>${mes}</b> (${esc(r.plan)}) já está disponível.`, lbl: "VALOR A PAGAR", due: `vence em ${br(r.due_date)}`, scan: "Abra o app do seu banco e leia o QR Code", cc: "Ou use o Pix copia e cola:", card: "Ou pague com cartão no app", only: r.currency === "BRL" ? "Pagar com Pix ou cartão no app" : "Pagar no app", hint: r.currency === "BRL" ? "" : "Cartão ou Wise, em menos de um minuto.", ign: "Se já pagou, pode ignorar este e-mail." };
  let body = `<p style="margin:0 0 18px">${T.hi}</p>${big(T.lbl, val, T.due)}`;
  if (pix) {
    body += `<div style="text-align:center;margin:0 0 10px"><img src="${pix.img}" width="170" height="170" alt="QR Code Pix" style="border:6px solid #fff;border-radius:6px"></div>`
      + `<div style="text-align:center;font-size:13px;color:#5A6577;margin:0 0 14px">${T.scan}</div>`
      + `<div style="font-size:13px;color:#5A6577;margin:0 0 6px">${T.cc}</div><div style="font-family:Consolas,monospace;font-size:12px;background:#fff;border:1px dashed #C9A13B;border-radius:6px;padding:10px 12px;color:#17202F;word-break:break-all">${esc(pix.payload)}</div>`
      + `<div style="text-align:center;margin:20px 0">${btn(T.card, app)}</div>`;
  } else {
    body += `<div style="text-align:center;margin:0 0 ${T.hint ? 8 : 20}px">${btn(T.only, app)}</div>` + (T.hint ? `<div style="text-align:center;font-size:13px;color:#5A6577;margin:0 0 20px">${T.hint}</div>` : "");
  }
  body += `<p style="margin:0 0 6px;font-size:13px;color:#5A6577">${T.ign}</p>`;
  const text = `${T.hi.replace(/<[^>]+>/g, "")}\n${T.lbl}: ${val} (${T.due})\n` + (pix ? `${T.cc}\n${pix.payload}\n` : "") + `${app}\n\nBritland Academy · ${es ? "Financiero" : "Financeiro"}`;
  return { subject: T.sub, html: frame(body, es), text };
}

function receiptMail(r: Row) {
  const es = r.course === "es", paid = r.paid_on!;
  const n = `BA-REC-${paid.slice(0, 4)}-${String(r.id).padStart(4, "0")}`;
  const note = String(r.note || "");
  const met = /pix/i.test(note) ? "Pix" : /cart|tarj|card/i.test(note) ? (es ? "tarjeta" : "cartão") : /wise/i.test(note) ? "Wise" : "";
  const val = money(r.currency, r.amount), link = SITE + (es ? "espanol/" : "") + `account.html#recibo-${r.id}`;
  const T = es
    ? { sub: `Pago confirmado: ${val}`, pill: "Pagado", lbl: `RECIBO Nº ${n}`, when: `pagado el ${br(paid)}` + (met ? ` con ${met}` : ""), a: "Alumno", p: "Plan", ref: "Referente a", by: "Recibido por", b: "Descargar recibo en PDF", thx: `¡Gracias, ${esc(String(r.name || "").split(/\s+/)[0])}! Tu mensualidad ya aparece como pagada en la app.` }
    : { sub: `Pagamento confirmado: ${val}`, pill: "Pago", lbl: `RECIBO Nº ${n}`, when: `pago em ${br(paid)}` + (met ? ` por ${met}` : ""), a: "Aluno", p: "Plano", ref: "Referente a", by: "Recebido por", b: "Baixar recibo em PDF", thx: `Obrigado, ${esc(String(r.name || "").split(/\s+/)[0])}! Sua mensalidade já aparece como paga no app.` };
  const body = `<div style="text-align:center;margin:0 0 6px"><span style="display:inline-block;background:#E3F1E6;color:#1E6B34;font-weight:bold;font-size:13px;padding:5px 14px;border-radius:999px">${T.pill}</span></div>`
    + big(T.lbl, val, T.when)
    + `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e6e0cf;border-radius:6px;margin:0 0 18px"><tr><td style="padding:12px 16px">${rows([[T.a, esc(r.name)], [T.p, esc(r.plan)], [T.ref, esc(refOf(r, es))], [T.by, "Cruz e Trento Cursos de Idiomas"]])}</td></tr></table>`
    + `<p style="margin:0 0 18px;text-align:center">${T.thx}</p><div style="text-align:center;margin:0 0 20px">${btn(T.b, link)}</div>`;
  const text = `${T.lbl}\n${val} · ${T.when}\n${T.a}: ${r.name}\n${T.p}: ${r.plan}\n${T.ref}: ${refOf(r, es)}\n${T.by}: Cruz e Trento Cursos de Idiomas\n\n${link}\n\nBritland Academy · ${es ? "Financiero" : "Financeiro"}`;
  return { subject: T.sub, html: frame(body, es), text };
}

/* cobranca Pix da parcela no Asaas (so se o aluno ja tem cliente Asaas com CPF). Reaproveita uma pendente que ainda valha. */
async function pixFor(r: Row): Promise<{ payload: string; img: string } | null> {
  if (r.currency !== "BRL" || !ASAAS_KEY) return null;
  const { data: open } = await sb.from("checkouts").select("id,pix_payload,pix_image,pix_expires_at").eq("charge_id", r.id).eq("metodo", "pix").eq("status", "pending").not("pix_payload", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  let ckId: number, payload: string, image: string;
  if (open && (!open.pix_expires_at || new Date(open.pix_expires_at).getTime() > Date.now() + 864e5)) {
    ckId = open.id; payload = open.pix_payload; image = open.pix_image;
  } else {
    const { data: prev } = await sb.from("checkouts").select("gateway_customer_id").eq("user_id", r.uid).eq("gateway", "asaas").not("gateway_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const customer = prev?.gateway_customer_id;
    if (!customer) return null;
    const cents = Math.round(Number(r.amount) * 100);
    const { data: ck, error } = await sb.from("checkouts").insert({
      user_id: r.uid, slug: "mensalidade", plano: r.plan, periodo: "mensalidade", moeda: "BRL", meses: 1, charge_id: r.id,
      valor_centavos: cents, total_centavos: cents, metodo: "pix", gateway: "asaas", gateway_customer_id: customer, erro: "via e-mail",
    }).select("id").single();
    if (error) throw error;
    try {
      const today = isoBR();
      const p = await asaas("/payments", { method: "POST", body: { customer, billingType: "PIX", value: cents / 100, dueDate: r.due_date < today ? today : r.due_date, description: `Britland Academy · Mensalidade ${r.plan} · ${refOf(r, false)}`, externalReference: `${r.uid}|charge|${r.id}` } });
      const q = await asaas(`/payments/${p.id}/pixQrCode`);
      await sb.from("checkouts").update({ gateway_ref: p.id, pix_payload: q.payload, pix_image: q.encodedImage, pix_expires_at: q.expirationDate ? new Date(String(q.expirationDate).replace(" ", "T") + "-03:00").toISOString() : null }).eq("id", ck.id);
      ckId = ck.id; payload = q.payload; image = q.encodedImage;
    } catch (e) {
      await sb.from("checkouts").update({ status: "failed", erro: String((e as Error).message).slice(0, 300) }).eq("id", ck.id);
      return null;
    }
  }
  // e-mail nao mostra imagem embutida (data:), entao o QR vai para o bucket publico com nome impossivel de adivinhar
  const path = `${ckId}-${crypto.randomUUID()}.png`;
  const bin = Uint8Array.from(atob(image), (c) => c.charCodeAt(0));
  const up = await sb.storage.from("pix-qr").upload(path, bin, { contentType: "image/png", upsert: true });
  if (up.error) return null;
  return { payload, img: sb.storage.from("pix-qr").getPublicUrl(path).data.publicUrl };
}

/* parcela paga por outro caminho: cancela a cobranca Pix do e-mail no Asaas para o aluno nao pagar duas vezes */
async function cancelStalePix() {
  const { data } = await sb.from("checkouts").select("id,gateway_ref,charge_id").eq("gateway", "asaas").eq("metodo", "pix").eq("status", "pending").not("charge_id", "is", null).not("gateway_ref", "is", null);
  let n = 0;
  for (const ck of data || []) {
    const { data: c } = await sb.from("charges").select("paid_on").eq("id", ck.charge_id).maybeSingle();
    if (!c?.paid_on) continue;
    try { await asaas(`/payments/${ck.gateway_ref}`, { method: "DELETE" }); } catch (_e) { /* ja paga ou ja removida */ }
    await sb.from("checkouts").update({ status: "canceled" }).eq("id", ck.id);
    n++;
  }
  return n;
}

async function load(where: (q: any) => any) {
  let q = sb.from("charges").select("id,sub_id,due_date,currency,amount,paid_on,note,title,subs!inner(user_id,plan,active,profiles!inner(id,email,name,course,status,is_admin))");
  q = where(q);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id, sub_id: c.sub_id, due_date: c.due_date, currency: c.currency === "EUR" ? "EUR" : "BRL", amount: Number(c.amount), paid_on: c.paid_on, note: c.note, title: c.title,
    uid: c.subs.user_id, email: c.subs.profiles.email, name: c.subs.profiles.name || "", course: c.subs.profiles.course === "es" ? "es" : "en", plan: c.subs.plan || "",
    ok: c.subs.profiles.status === "approved" && !c.subs.profiles.is_admin && !!c.subs.profiles.email && Number(c.amount) > 0, active: c.subs.active !== false,
  })).filter((r: any) => r.ok) as (Row & { active: boolean })[];
}

async function sentSet(kind: string, ids: number[]) {
  if (!ids.length) return new Set<string>();
  const { data } = await sb.from("notif_log").select("ref").eq("kind", kind).in("ref", ids.map(String));
  return new Set((data || []).map((x: any) => x.ref));
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const h = nowBR().getUTCHours();
  if (!body.force && (h < 9 || h >= 19)) return out({ skipped: "fora do horario" });
  const pass = (Deno.env.get("SMTP_PASS") || "").replace(/\s/g, ""), user = Deno.env.get("SMTP_USER");
  await ensureLogo();
  let canceled = 0;
  try { canceled = await cancelStalePix(); } catch (_e) { /* tenta de novo */ }
  if (!pass || !user) return out({ skipped: "sem SMTP_PASS", canceled });

  /* teste: manda um aviso e um recibo de exemplo so para o e-mail do professor (admin) */
  if (body.test) {
    const { data: adm } = await sb.from("profiles").select("email,name").eq("is_admin", true).order("created_at").limit(1).maybeSingle();
    if (!adm?.email) return out({ error: "sem admin" });
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
    const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
    const ex: Row = { id: 231, sub_id: 0, due_date: addDays(isoBR(), 5), currency: "BRL", amount: 790, paid_on: null, note: null, title: null, uid: "", email: adm.email, name: adm.name || "Paulo", course: body.test === "es" ? "es" : "en", plan: "Fluency Club" };
    const qr = { payload: "00020126580014br.gov.bcb.pix0136exemplo-de-teste-nao-pague5204000053039865406790.005802BR5925CRUZ E TRENTO6009FRANCA6304ABCD", img: QR_TEST };
    const ms = [noticeMail(ex, qr), noticeMail({ ...ex, currency: "EUR", amount: 120 }, null), receiptMail({ ...ex, paid_on: isoBR(), note: "Pago no app por Pix" })];
    const errs: string[] = [];
    for (const m of ms) { try { await client.send({ from: Deno.env.get("MAIL_FROM") || user, to: adm.email, subject: "[TESTE] " + m.subject, content: m.text, html: m.html }); } catch (e) { errs.push(String((e as Error).message).slice(0, 160)); } }
    try { await client.close(); } catch (_e) { /* ignora */ }
    return out({ test: adm.email.replace(/^(.).*@/, "$1***@"), from: Deno.env.get("MAIL_FROM") || user, sent: ms.length - errs.length, errs });
  }
  const today = isoBR();
  const due = (await load((q) => q.is("paid_on", null).gte("due_date", today).lte("due_date", addDays(today, 5)))).filter((r) => r.active);
  const paid = await load((q) => q.not("paid_on", "is", null).gte("paid_on", START).gte("paid_on", addDays(today, -3)));
  const sentA = await sentSet("pay_email", due.map((r) => r.id)), sentB = await sentSet("paid_email", paid.map((r) => r.id));
  const todo = [...due.filter((r) => !sentA.has(String(r.id))).map((r) => ({ r, k: "pay_email" })), ...paid.filter((r) => !sentB.has(String(r.id))).map((r) => ({ r, k: "paid_email" }))];
  if (!todo.length) return out({ due: due.length, paid: paid.length, sent: 0, canceled });

  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
  const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
  let sent = 0; const errs: string[] = [];
  for (const { r, k } of todo) {
    try {
      const m = k === "pay_email" ? noticeMail(r, await pixFor(r).catch(() => null)) : receiptMail(r);
      await client.send({ from: Deno.env.get("MAIL_FROM") || user, to: r.email, subject: m.subject, content: m.text, html: m.html });
      await sb.from("notif_log").insert({ user_id: r.uid, kind: k, ref: String(r.id) });
      sent++;
    } catch (e) { errs.push(`${k} ${r.id}: ${String((e as Error).message).slice(0, 120)}`); }
  }
  try { await client.close(); } catch (_e) { /* ignora */ }
  return out({ due: due.length, paid: paid.length, sent, canceled, errs });
});
