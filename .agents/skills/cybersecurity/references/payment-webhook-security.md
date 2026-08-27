# Payment Gateway Webhook & Transaction Security Reference

## 1. Webhook Signature Verification (HMAC SHA-256)

Never trust incoming webhook payloads blindly without verifying the cryptographic signature provided in HTTP headers.

### Midtrans Verification Pattern

```typescript
import { createHash } from "node:crypto";

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string,
): boolean {
  const hash = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  return hash === signatureKey;
}
```

### Xendit / Tripay HMAC Verification Pattern

```typescript
import { createHmac } from "node:crypto";

export function verifyHmacSignature(
  rawBody: string,
  secretKey: string,
  receivedSignature: string,
): boolean {
  const expected = createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");

  return expected === receivedSignature;
}
```

---

## 2. Idempotent Order Fulfillment

Payment gateways frequently retry webhook deliveries on network fluctuations. Processing twice will credit double XP, duplicate notifications, or create double financial entries.

### Pattern:

```typescript
export async function fulfillOrder(orderNumber: string) {
  const order = await getOrderByOrderNumber(orderNumber);

  // Guard against duplicate processing
  if (order.payment_status === "paid") {
    return { alreadyFulfilled: true };
  }

  // Atomically update status to paid
  await updateOrderStatus(order.id, "paid");

  // Distribute earnings and XP once
  await creditCreatorPayout(order.seller_id, order.creator_payout_amount);
  await awardUserXp(order.seller_id, "PRESET_PURCHASED");
}
```

---

## 3. Atomic Withdrawal Mutex & Anti-Race Condition

Withdrawal requests must verify available balance within a database transaction or atomic check so that rapid parallel requests cannot withdraw more than the available balance (double spending).
