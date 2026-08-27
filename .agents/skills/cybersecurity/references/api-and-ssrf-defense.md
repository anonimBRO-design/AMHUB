# API Security & Anti-SSRF Defense Reference

## 1. Server-Side Request Forgery (SSRF) Guard

When an endpoint fetches an external URL submitted by a user (e.g. validating Alight Motion preset links, importing XML, or verifying webhooks), attackers may probe internal networks or cloud metadata.

### Prohibited Destination Ranges

```typescript
export function isPrivateOrInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase().trim();

  // 1. Localhost and internal TLDs
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".lan") ||
    h === "0.0.0.0"
  ) {
    return true;
  }

  // 2. IPv4 private & link-local ranges
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [, a, b] = ipv4.map(Number);
    if (a === 127 || a === 10 || a === 0) return true; // Loopback, 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // Link-local / Cloud Metadata (169.254.169.254)
    return false;
  }

  // 3. IPv6 loopback & site-local
  const cleanIpv6 = h.replace(/^\[|\]$/g, "");
  if (
    cleanIpv6 === "::1" ||
    cleanIpv6 === "::" ||
    cleanIpv6.startsWith("fe80:") ||
    cleanIpv6.startsWith("fc") ||
    cleanIpv6.startsWith("fd")
  ) {
    return true;
  }

  return false;
}
```

---

## 2. Resource Exhaustion & Slowloris Prevention

Always configure timeouts and request size limits:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s max

const res = await fetch(targetUrl, {
  method: "GET",
  signal: controller.signal,
  headers: {
    "User-Agent": "AMHUB-Validator/1.0",
    Range: "bytes=0-1024", // Fetch only first 1KB for validation
  },
});
clearTimeout(timeout);
```

---

## 3. Distributed Rate Limiting

Ensure rate limits are enforced per IP or user ID on all critical routes:

- `/api/validate-link`: 30 req / min (IP-based)
- `/api/presets` POST: 10 req / min (User-based)
- `/api/creators/withdrawals` POST: 5 req / min (User-based)
- `/api/comments` POST: 20 req / min (User-based)
