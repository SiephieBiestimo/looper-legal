// Cloudflare Pages Function — POST /api/subscribe
// Receives a waitlist signup from the homepage form and:
//   1. forwards it to Loops (the email tool) so the welcome email fires and the
//      contact is added to the launch list, and
//   2. stores a copy in a KV namespace bound as `WAITLIST` as a fail-safe, so a
//      signup is never lost even if Loops is briefly unreachable.
// Accepts JSON or form-encoded bodies, drops honeypot hits, de-duplicates by email.
//
// Setup (one-time, in the Cloudflare Pages project → Settings):
//   - Environment variables: add a SECRET named  LOOPS_API_KEY  (from Loops →
//     Settings → API). Without it, signups still save to KV but no email sends.
//   - (optional) KV bindings: bind the `looper_waitlist` namespace to  WAITLIST.
// Read the KV backup later with:  wrangler kv key list --binding WAITLIST

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

    // Fail-safe copy in KV (your own backup of the raw list).
    if (env.WAITLIST) {
      const meta = {
        ts: new Date().toISOString(),
        ua: (request.headers.get('user-agent') || '').slice(0, 160),
        country: request.headers.get('cf-ipcountry') || '',
      };
      await env.WAITLIST.put('sub:' + email, JSON.stringify(meta));
    }

    // Forward to Loops — adds the contact and triggers the welcome email.
    // A 409 means the contact already exists, which we treat as success.
    // `emailed` tells the page whether a welcome email actually went out, so
    // the confirmation can't promise an email that wasn't sent (e.g. before the
    // key is configured, or if Loops is briefly down — signup still lands in KV).
    let emailed = false;
    if (env.LOOPS_API_KEY) {
      const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer ' + env.LOOPS_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'waitlist',
          subscribed: true,
        }),
      });
      emailed = res.ok || res.status === 409;
    }

    return json({ ok: true, emailed: emailed });
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
