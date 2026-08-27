# Alight Motion Preset XML & Upload Security Reference

## 1. XXE (XML External Entity) Vulnerability Defense

XML files can be exploited to read server files, initiate SSRF attacks, or trigger denial of service (Billion Laughs / entity expansion attack).

### Vulnerable Indicators in Uploaded XML

Any of the following tags or keywords indicate an exploit payload:

- `<!DOCTYPE`
- `<!ENTITY`
- `SYSTEM`
- `PUBLIC`
- `xinclude`

### Validation Rule for Alight Motion Presets

Legitimate Alight Motion presets start with either a `<scene>` or `<project>` root element:

```typescript
export function validateAlightMotionXmlContent(xmlString: string): {
  valid: boolean;
  reason?: string;
} {
  // Check for dangerous DTD / entity injections
  if (/<!DOCTYPE/i.test(xmlString) || /<!ENTITY/i.test(xmlString)) {
    return {
      valid: false,
      reason: "DTD and Entity declarations are prohibited in preset XML.",
    };
  }

  // Check for expected root tag
  const isAmScene = /<scene[\s>]/i.test(xmlString);
  const isAmProject = /<project[\s>]/i.test(xmlString);

  if (!isAmScene && !isAmProject) {
    return {
      valid: false,
      reason:
        "Uploaded XML does not match Alight Motion preset specifications.",
    };
  }

  return { valid: true };
}
```

---

## 2. File Upload Whitelist & Storage Constraints

| Type              | Allowed MIME Types                           | Allowed Extensions               | Max File Size |
| :---------------- | :------------------------------------------- | :------------------------------- | :------------ |
| **XML Preset**    | `application/xml`, `text/xml`, `text/plain`  | `.xml`                           | 5 MB          |
| **QR Image**      | `image/png`, `image/jpeg`, `image/webp`      | `.png`, `.jpg`, `.jpeg`, `.webp` | 5 MB          |
| **Thumbnail**     | `image/png`, `image/jpeg`, `image/webp`      | `.png`, `.jpg`, `.jpeg`, `.webp` | 10 MB         |
| **Preview Video** | `video/mp4`, `video/webm`, `video/quicktime` | `.mp4`, `.webm`, `.mov`          | 50 MB         |
