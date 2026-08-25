import "server-only";

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function secretKey(): string {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) throw new Error("FLW_SECRET_KEY is not set");
  return key;
}

export async function initiatePayment(params: {
  txRef: string;
  amount: number;
  redirectUrl: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}): Promise<string> {
  const res = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: "NGN",
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customerEmail,
        phonenumber: params.customerPhone,
        name: params.customerName,
      },
      customizations: {
        title: "The House",
      },
    }),
  });

  const json = await res.json();
  if (json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || "Failed to initiate payment");
  }
  return json.data.link as string;
}

export type FlwVerifyResult = {
  status: string;
  amount: number;
  currency: string;
  txRef: string;
};

export async function verifyTransaction(transactionId: string): Promise<FlwVerifyResult> {
  const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Failed to verify transaction");
  }

  return {
    status: json.data.status,
    amount: json.data.amount,
    currency: json.data.currency,
    txRef: json.data.tx_ref,
  };
}

export function verifyWebhookSignature(headerValue: string | null): boolean {
  const expected = process.env.FLW_WEBHOOK_SECRET_HASH;
  return !!expected && headerValue === expected;
}
