import { headers } from "next/headers";
import { BusinessProfile, PaymentHandlerResponse } from "@/app/ucp/schema";
import { getSigningKeys } from "@/app/ucp/keys";

export async function GET() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const signingKeys = getSigningKeys();

  // Payment handler for Arc Pay wallet
  const paymentHandlers: PaymentHandlerResponse[] = [
    {
      id: "arcpay",
      name: "ai.arcpay.wallet",
      version: "2026-01-15",
      spec: "https://arcpay.ai/ucp/guides/arcpay-payment-handler",
      config_schema: "https://arcpay.ai/ucp/schemas/arcpay_config.json",
      instrument_schemas: [
        "https://arcpay.ai/ucp/schemas/arcpay_wallet_payment_instrument.json",
      ],
      config: {
        environment: "sandbox",
        merchant_id: process.env.ARCPAY_MERCHANT_ID ?? "",
      },
    },
  ];

  const profile: BusinessProfile = {
    ucp: {
      version: "2026-01-11",
      services: {
        "dev.ucp.shopping": {
          version: "2026-01-11",
          spec: "https://ucp.dev/specification/overview",
          rest: {
            schema: "https://ucp.dev/services/shopping/rest.openapi.json",
            endpoint: `${baseUrl}/api/ucp`,
          },
        },
      },
      capabilities: [
        {
          name: "dev.ucp.shopping.checkout",
          version: "2026-01-11",
          spec: "https://ucp.dev/specification/checkout",
          schema: "https://ucp.dev/schemas/shopping/checkout.json",
        },
        {
          name: "dev.ucp.shopping.fulfillment",
          version: "2026-01-11",
          spec: "https://ucp.dev/specification/fulfillment",
          schema: "https://ucp.dev/schemas/shopping/fulfillment.json",
          extends: "dev.ucp.shopping.checkout",
        },
      ],
    },
    payment: {
      handlers: paymentHandlers,
    },
    signing_keys: signingKeys,
  };

  return new Response(JSON.stringify(profile, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
