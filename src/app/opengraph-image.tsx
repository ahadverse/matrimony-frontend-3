import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo/site';

// Facebook, WhatsApp, LinkedIn and X all crop to roughly 1.91:1 — 1200×630 is
// the size every one of them accepts without re-cropping.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

/**
 * The shared link preview, generated at build time rather than maintained as a
 * design asset, so it can never fall out of sync with the brand constants.
 * No custom font is loaded: ImageResponse's built-in face renders this Latin
 * text fine, and bundling a .ttf would slow every build for no visible gain.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7a1338 0%, #b81e5a 55%, #e0518a 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '0 96px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: '-0.02em' }}>{SITE_NAME}</div>
        <div style={{ marginTop: 24, fontSize: 40, opacity: 0.92 }}>{SITE_TAGLINE}</div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            opacity: 0.8,
            maxWidth: 880,
            lineHeight: 1.4,
          }}
        >
          Phone-verified profiles · Reviewed by our team · Family-friendly from the first message
        </div>
      </div>
    ),
    size,
  );
}
