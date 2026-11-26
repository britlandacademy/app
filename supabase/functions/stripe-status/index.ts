// stripe-status: diz so se as chaves do Stripe tem o formato certo (nunca devolve os valores).
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const sk = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const pk = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
  const wh = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const o = {
    secret: /^(sk|rk)_live_/.test(sk) ? "live" : /^(sk|rk)_test_/.test(sk) ? "test" : sk ? "invalida" : "vazia",
    publishable: /^pk_live_/.test(pk) ? "live" : /^pk_test_/.test(pk) ? "test" : pk ? "invalida" : "vazia",
    webhook: /^whsec_/.test(wh) ? "ok" : wh ? "invalida" : "vazia",
    sameAccount: sk.slice(8, 24) === pk.slice(8, 24),
  };
  return new Response(JSON.stringify(o), { headers: { ...CORS, "content-type": "application/json" } });
});
