import "server-only";
import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export async function initiatePayment(params: {
  txRef: string;
  amount: number;
  redirectUrl: string;
  customerEmail: string;
}): Promise<string> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference: params.txRef,
      // Paystack expects the amount in kobo (NGN * 100).
      amount: Math.round(params.amount * 100),
      currency: "NGN",
      email: params.customerEmail,
      callback_url: params.redirectUrl,
    }),
  });

  const json = await res.json();
  if (!json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Failed to initiate payment");
  }
  return json.data.authorization_url as string;
}

export type PaystackVerifyResult = {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  id: number;
};

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } }
  );

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || "Failed to verify transaction");
  }

  return {
    status: json.data.status,
    // Paystack reports amount in kobo; convert back to naira.
    amount: json.data.amount / 100,
    currency: json.data.currency,
    reference: json.data.reference,
    id: json.data.id,
  };
}

// Paystack signs webhook bodies with HMAC-SHA512 of the raw request body
// using the secret key, sent in the x-paystack-signature header — unlike
// Flutterwave's static shared-secret header, this must be computed per
// request against the exact raw body.
export function verifyWebhookSignature(signature: string | null, rawBody: string): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  return hash === signature;
}
