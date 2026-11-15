import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const securityHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

/**
 * Content security policy, in one place. The app is fully client-side and
 * self-hosted, so only inline styles (Tailwind and component style props) and
 * blob images are allowed. `dev` adds what HMR needs, `meta` drops
 * `frame-ancestors`, which a meta tag ignores.
 */
function buildCsp(mode: 'dev' | 'meta' | 'prod' = 'prod'): string {
  const directives = [
    "default-src 'self'",
    mode === 'dev' ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    mode === 'dev' ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ]
  if (mode !== 'meta') directives.push("frame-ancestors 'none'")
  return directives.join('; ')
}

/** Renders a static host's `_headers` file from the same header set. */
function headerFile(headers: Record<string, string>): string {
  return ['/*', ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`), ''].join(
    '\n',
  )
}

/** Complete header set: the static hardening headers plus the CSP for the target. */
function securityHeaderSet(mode: 'dev' | 'prod' = 'prod'): Record<string, string> {
  return { ...securityHeaders, 'Content-Security-Policy': buildCsp(mode) }
}

/** Ships the CSP as a meta tag and the full header set as `_headers` on build. */
function securityPlugin(): Plugin {
  return {
    apply: 'build',
    generateBundle() {
      this.emitFile({
        fileName: '_headers',
        source: headerFile(securityHeaderSet()),
        type: 'asset',
      })
    },
    name: 'security',
    transformIndexHtml: () => [
      {
        attrs: { content: buildCsp('meta'), 'http-equiv': 'Content-Security-Policy' },
        tag: 'meta',
      },
    ],
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), securityPlugin()],
  preview: {
    headers: securityHeaderSet(),
  },
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    headers: securityHeaderSet('dev'),
  },
})
