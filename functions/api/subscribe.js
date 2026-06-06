// Cloudflare Pages Function — POST /api/subscribe
// Receives a waitlist signup from the homepage form and stores it in a KV
// namespace bound as `WAITLIST`. Accepts JSON or form-encoded bodies, drops
// honeypot hits, and de-duplicates by email (the KV key is the email).
//
// Setup (one-time, in the Cloudflare dashboard or wrangler):
//   1. Create a KV namespace, e.g. "looper_waitlist".
//   2. In the Pages project → Settings → Functions → KV bindings,
//      bind that namespace to the variable name  WAITLIST.
// Read the list later with:  wrangler kv:key list --binding WAITLIST
// (or browse the namespace in the dashboard).

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    let email = '';
    let company = '';
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = body.email || '';
      company = body.company || '';
    } else {
      const form = await request.formData();
      email = form.get('email') || '';
      company = form.get('company') || '';
    }

    // Honeypot: real users never fill this hidden field. Pretend success.
    if (company) return json({ ok: true });

    email = String(email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      return json({ ok: false, error: 'invalid' }, 400);
    }

    if (env.WAITLIST) {
      const meta = {
        ts: new Date().toISOString(),
        ua: (request.headers.get('user-agent') || '').slice(0, 160),
        country: request.headers.get('cf-ipcountry') || '',
      };
      await env.WAITLIST.put('sub:' + email, JSON.stringify(meta));
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'server' }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'content-type': 'application/json' },
  });
}
