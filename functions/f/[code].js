// Cloudflare Pages Function — GET /f/{code}
// Friend-invite landing page. On Android phones with Looper installed,
// App Links intercept these URLs before the browser ever loads this page
// (verified via /.well-known/assetlinks.json). Everyone else — no app,
// iPhone, desktop — lands here: a short pitch plus the friend code so it
// can be entered manually in the app after install/sign-in.
//
// Pre-launch the CTA points at the waitlist; once a store listing exists,
// swap STORE_URL below for the Play/App Store link.

const STORE_URL = 'https://looperai.golf/#waitlist';

export async function onRequestGet(context) {
  const code = (context.params.code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Play with me on Looper</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0C140E;
    color: #F2EBD7;
    font-family: Georgia, 'Times New Roman', serif;
    text-align: center;
  }
  .card { max-width: 420px; padding: 48px 28px; }
  h1 { font-style: italic; font-weight: 600; font-size: 28px; margin: 0 0 12px; color: #F5E6C8; }
  p { font-size: 15px; line-height: 1.55; color: #E6E0D2; opacity: .85; margin: 0 0 24px; }
  .code-label { font-size: 11px; letter-spacing: 2px; color: #C8A96A; margin-bottom: 8px; }
  .code {
    display: inline-block;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 6px;
    color: #F5E6C8;
    border: 1px solid #C8A96A;
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 28px;
  }
  a.cta {
    display: inline-block;
    background: #2E6B25;
    color: #F5E6C8;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: 12px;
  }
  .fine { font-size: 12px; opacity: .6; margin-top: 24px; }
</style>
</head>
<body>
  <div class="card">
    <h1>You&rsquo;re invited to Looper</h1>
    <p>A friend wants to add you on Looper &mdash; the AI caddie that
    reads the course, the wind and your game.</p>
    ${code ? `
    <div class="code-label">THEIR FRIEND CODE</div>
    <div class="code">${code}</div>
    <p>Have the app? Open Looper &rarr; Friends &rarr; Add Friend and
    enter the code.</p>` : ''}
    <a class="cta" href="${STORE_URL}">Get Looper</a>
    <div class="fine">looperai.golf</div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
