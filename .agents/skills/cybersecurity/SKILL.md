---
name: cybersecurity-auditor
description: Comprehensive cybersecurity auditing and defensive engineering guide for AMHUB. Covers OWASP Top 10, Next.js 15 App Router hardening, Supabase RLS security, XML/XXE upload protections, anti-SSRF defenses, and payment webhook verification. Use when auditing code security, reviewing endpoints, hardening permissions, or investigating potential vulnerabilities.
argument-hint: "[audit|review|harden] [file-or-feature]"
metadata:
  author: AMHUB Security Team
  version: "1.0.0"
---

# Cybersecurity Auditor & Defensive Engineering

Specialized security skill for auditing, securing, and defending the AMHUB platform (Next.js 15, Supabase, PostgreSQL, Alight Motion preset uploads, and payment processing).

---

## When to Activate This Skill

- Auditing existing or new API routes (`/api/*`) for vulnerabilities (OWASP Top 10, SSRF, IDOR, Rate Limiting).
- Writing and reviewing Supabase migrations and PostgreSQL Row Level Security (RLS) policies.
- Validating file upload handlers (Preset XML, QR images, thumbnails, videos) against XXE, malware, and MIME spoofing.
- Auditing payment gateway callbacks and creator payout/withdrawal flows for HMAC signature authenticity, idempotency, and race conditions.
- Reviewing authentication, session handling, and Authorization headers across the application.

---

## Core Security Pillars

### 1. Supabase Row Level Security (RLS) & Data Exposure

- **Principle of Least Privilege**: Never grant `SELECT` on sensitive columns (`email`, `phone`, `auth_provider`, `payout_account`) to `anon` or `public`.
- **Authenticated Isolation**: Multi-tenant data (orders, downloads, bookmarks, private presets) must strictly verify ownership (`auth.uid() = user_id` or `public.is_staff()`).
- **Service Role Containment**: `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS. Keep its usage strictly inside server-only route handlers or background workers; never expose to the client.
- _Reference_: Read `references/supabase-rls-hardening.md` for policy patterns and test queries.

### 2. API Endpoint Protection & Anti-SSRF

- **Distributed Rate Limiting**: All mutation and external-fetching routes must enforce rate limiting via IP or authenticated user ID.
- **Strict SSRF Mitigation**: When fetching external URLs (e.g. `/api/validate-link`):
  - Deny private IPv4 blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `0.0.0.0`).
  - Deny internal domains (`localhost`, `*.local`, `*.internal`, `*.lan`).
  - Enforce timeout signals (`AbortSignal`) and byte limits (`Range: bytes=0-1024` or max 512KB).
  - Restrict allowed ports to default HTTPS (443).
- _Reference_: Read `references/api-and-ssrf-defense.md` for implementation details.

### 3. XML & Upload Pipeline Defense

- **XXE & XML Bomb Protection**:
  - Alight Motion presets are XML files. The server must reject external entities (`<!ENTITY`, `SYSTEM`, `PUBLIC`) and DTD declarations (`<!DOCTYPE`).
  - Enforce max size limits (e.g. 5 MB for XML, 10 MB for images, 50 MB for videos).
- **MIME & Extension Whitelisting**:
  - Verify both Content-Type headers and file extensions.
  - Store user-uploaded files on isolated storage buckets with strict download content-disposition (`attachment; filename=...`).
- _Reference_: Read `references/xml-preset-security.md`.

### 4. Financial & Payment Webhook Security

- **HMAC Signature Verification**:
  - All payment gateway webhooks (Midtrans, Xendit, Tripay, Pakasir) MUST verify the cryptographic signature header before processing.
- **Idempotency & Replay Attack Prevention**:
  - Webhook handlers must be idempotent: duplicate delivery of `status = 'paid'` must not credit creator XP or balance twice.
- **Atomic Balance Mutex**:
  - Withdrawal requests must check available balance atomically to prevent race condition double-spending.
- _Reference_: Read `references/payment-webhook-security.md`.

---

## 5-Minute Fast Audit Checklist

Before merging or deploying any route or DAL function:

1. [ ] **Authentication**: Is `requireApiProfile()` or `requireAuth()` called for sensitive endpoints?
2. [ ] **Authorization (IDOR)**: Does the query verify `creator_id = user.id` or `user_id = profile.id` before mutating?
3. [ ] **Input Validation**: Are all request parameters and request bodies strictly validated with Zod (`validateJson`, `validateQuery`)?
4. [ ] **Rate Limiting**: Is `enforceRateLimit()` in place for public, auth, and upload endpoints?
5. [ ] **Error Masking**: Are raw database errors sanitized via `apiErrorResponse()` rather than leaked to clients?
