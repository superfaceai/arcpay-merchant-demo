import { headers } from "next/headers";
import { BusinessProfile, PaymentHandler } from "@/app/ucp/schema";
import { getSigningKeys } from "@/app/ucp/keys";

export async function GET() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const signingKeys = getSigningKeys();

  // Payment handler for Arc Pay
  const paymentHandlers: PaymentHandler[] = [
    {
      id: "ai.arcpay.wallet",
      spec: "https://arcpay.ai/docs",
      schema: "https://arcpay.ai/schemas/payment-handler.json",
    },
  ];

  const profile: BusinessProfile = {
    ucp: {
      version: "2026-01-11",
      services: {
        shopping: {
          version: "2026-01-11",
          spec: "https://ucp.dev/specification/checkout/",
          rest: {
            schema: "https://ucp.dev/schemas/shopping/checkout.json",
            base_url: `${baseUrl}/api/ucp`,
          },
        },
      },
      capabilities: [
        {
          id: "dev.ucp.shopping.checkout",
          spec: "https://ucp.dev/specification/checkout/",
          schema: "https://ucp.dev/schemas/shopping/checkout.json",
          version: "2026-01-11",
        },
        {
          id: "dev.ucp.shopping.fulfillment",
          spec: "https://ucp.dev/specification/fulfillment/",
          schema: "https://ucp.dev/schemas/shopping/checkout.json#fulfillment",
          version: "2026-01-11",
        },
      ],
    },
    payment: {
      handlers: paymentHandlers,
      signing_keys: signingKeys,
    },
  };

  return Response.json(profile, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

