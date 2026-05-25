# Frontend Security Breach Archives

Date: 2026-05-26

This index tracks frontend security findings, repairs, and verification evidence. Each confirmed breach or control gap has its own archive.

| Archive | Severity | Status | Summary |
| --- | --- | --- | --- |
| [security-breach-frontend-001-token-storage.md](security-breach-frontend-001-token-storage.md) | Critical | Fixed | Browser-readable JWT persistence was removed in favor of httpOnly cookie sessions. |
| [security-breach-frontend-002-eventsource-token-url.md](security-breach-frontend-002-eventsource-token-url.md) | High | Fixed | Access tokens are no longer sent in EventSource query strings. |
| [security-breach-frontend-003-unsafe-dom-sink.md](security-breach-frontend-003-unsafe-dom-sink.md) | Medium | Fixed | Google button container cleanup no longer uses `innerHTML`. |
| [security-breach-frontend-004-admin-data-leak.md](security-breach-frontend-004-admin-data-leak.md) | High | Fixed | Admin database payload logging and sensitive table tooltips were hardened. |
| [security-breach-frontend-005-csp-header-hardening.md](security-breach-frontend-005-csp-header-hardening.md) | High | Fixed | Frontend delivery headers and unsafe image URL handling were tightened. |
| [security-breach-frontend-006-ci-security-gates.md](security-breach-frontend-006-ci-security-gates.md) | Medium | Fixed | CI now includes frontend dependency audit and forbidden-pattern checks. |
| [security-breach-frontend-007-csrf-cookie-auth.md](security-breach-frontend-007-csrf-cookie-auth.md) | High | Fixed | Cookie-authenticated unsafe requests now require a CSRF token header. |

## Final Verification Checklist

- Frontend lint and build must pass in `View`.
- Backend e2e auth/security tests must pass after cookie/JWT changes.
- `npm audit --audit-level=moderate --json` must be run for `View`; CI now runs it and uploads the audit JSON.
- Forbidden frontend patterns must remain absent: `dangerouslySetInnerHTML`, `.innerHTML =`, `eval`, `new Function`, `javascript:` URLs, browser-readable JWT persistence, and EventSource URL tokens.
- Authenticated unsafe API requests must include `X-CSRF-Token` matching the readable `vg_csrf_token` cookie.
- Login, logout, Google login, reset password, protected dashboard routes, live logs, and admin database screens must be manually smoke-tested after deployment.
