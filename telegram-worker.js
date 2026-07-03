/* ═══════════════════════════════════════════
   AHISTAA CROCHET — telegram-worker.js
   ═══════════════════════════════════════════
   Ye chhota sa "server function" hai jo Cloudflare Workers
   (free) pe chalega. Iska kaam sirf itna hai:

   1. Aapki website (script.js) se ek message receive karna
   2. Us message ko Telegram ko forward kar dena

   Bot token yahan CODE mein nahi likha — ye Cloudflare ke
   "Secret" mein alag se save hota hai, jo kisi browser mein
   kabhi nahi jaata. Isliye ye SAFE hai.

   Setup ke pure steps TELEGRAM-SETUP-GUIDE.txt file mein hain.
   ═══════════════════════════════════════════ */

export default {
  async fetch(request, env) {
    // Browser pehle ek "permission check" (OPTIONS) bhejta hai —
    // usko allow karna zaroori hai warna real request fail ho jayegi.
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 });
    }

    try {
      const { text } = await request.json();

      // env.TELEGRAM_BOT_TOKEN aur env.TELEGRAM_CHAT_ID Cloudflare
      // Dashboard mein "Secret" ke roop mein set kiye jayenge
      // (setup guide mein exact steps hain) — code mein kahin
      // nahi likhe.
      if (!text || typeof text !== 'string') {
        return new Response('Missing "text" in request body', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

      // NOTE: parse_mode is intentionally left plain (no Markdown/HTML).
      // Order details (name/address) come straight from the customer, and
      // Telegram's Markdown parser will reject the whole message if it
      // contains a stray *, _, [, ] etc. Plain text always sends reliably.
      const tgResp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: text
        })
      });

      if (!tgResp.ok) {
        const errBody = await tgResp.text();
        return new Response('Telegram API error: ' + errBody, {
          status: 502,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      return new Response('OK', {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response('Error: ' + err.message, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};