// Cloudflare Pages Function — GET /go
// Device-aware entry point for the beta QR code. The printed QR encodes
// looperai.golf/go so a single scan routes each phone to the least-friction
// path its platform allows:
//   • iPhone  -> straight to the TestFlight invite (skips the landing page).
//               TestFlight is Apple's mandatory gateway, so a tester who
//               doesn't have it yet still gets Apple's "install TestFlight
//               first" screen — that's Apple's, not ours.
//   • Android -> straight to the Play Store listing (open testing — install
//               is one tap, no tester group or opt-in step).
//   • Everyone else (iPad, desktop) -> the /beta landing page, which explains
//               the platform-specific steps.
//
// /beta itself never redirects — it stays a plain, viewable page for anyone
// who sees or shares that link directly.

const TESTFLIGHT_URL = 'https://testflight.apple.com/join/bSM9FeWF';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.zarubia.golf';

export async function onRequestGet(context) {
  const ua = context.request.headers.get('user-agent') || '';
  // Only clear iPhone/iPod hits deep-link to TestFlight. Modern iPadOS reports
  // a desktop-Safari UA, so iPads fall through to /beta — fine, the page still
  // offers the TestFlight button.
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  let dest;
  if (isIPhone) {
    dest = TESTFLIGHT_URL;
  } else if (isAndroid) {
    dest = PLAY_STORE_URL;
  } else {
    dest = new URL('/beta', context.request.url).toString();
  }

  return Response.redirect(dest, 302);
}
