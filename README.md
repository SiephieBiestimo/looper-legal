# looperai.golf

Marketing site + legal docs for **Looper**, the AI golf caddie.
Operated by Zarubia Holdings Inc. Hosted on **Cloudflare Pages**.

## Structure
- `index.html` — landing page (hero, features, screenshot carousel + lightbox, stats, waitlist)
- `support.html` — support + FAQ
- `privacy.html` / `terms.html` — legal docs
- `404.html` — branded not-found page (Pages serves it with a 404 status)
- `styles.css` — shared styles ("Augusta Night" palette, matched to the app)
- `assets/` — emblem, app icon, OG card, optimised screenshots
- `functions/api/subscribe.js` — Cloudflare Pages Function for the waitlist (POST /api/subscribe)
- `.nojekyll` — serve files as-is

> No `wrangler.toml` lives in the repo (it would be served publicly). The KV
> binding is set on the **Pages project config** instead, so plain
> `wrangler pages deploy` keeps it.

## Waitlist (email capture)
The CTA form POSTs `{ email }` to `/api/subscribe`. The Function validates +
de-dupes and writes each signup to a **KV namespace bound as `WAITLIST`**
(key `sub:<email>`, value = timestamp/UA/country JSON).

**One-time setup:**
1. Create a KV namespace, e.g. `looper_waitlist`.
2. Pages project → Settings → Functions → **KV namespace bindings** →
   bind it to variable name **`WAITLIST`** (for Production *and* Preview).
3. Read signups later: `wrangler kv:key list --binding WAITLIST`
   (or browse the namespace in the dashboard).

If the binding is missing the form still returns success but nothing is stored —
so confirm the binding before relying on it.

## Deploy (Cloudflare Pages)
Plain static site + Functions — **no build step**.
- Build command: *(none)* · Output directory: `/` (repo root)
- Direct upload: `npx wrangler pages deploy . --project-name looper-site`
- Custom domain `looperai.golf` is attached in the Pages project (auto-creates
  the DNS since the zone is on Cloudflare).
- The other three domains 301-redirect to `looperai.golf` via Redirect Rules.

## Editing the legal docs
Edit `privacy.html` / `terms.html` directly and bump the "Last updated" date.
Entity details + contact email live in the page footers.

## Regenerating brand art
- `assets/og.png` — render `assets/og-card.html` at 1200×630 (headless Chrome).
- `assets/green-emblem.svg` — the inner emblem; geometry ported from the app
  source (`looper/.../logo/_emblem.py` + `splash/_build_anim.py`).
