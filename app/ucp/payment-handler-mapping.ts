import {
  PaymentProvider,
  PaymentMethod,
  PaymentProviderName,
} from "@/app/store/objects/payment";
import { PaymentHandlerResponse } from "./schema";

// =============================================================================
// Table 1: UCP Handlers by ID
// =============================================================================

const ucpHandlers: Record<string, PaymentHandlerResponse> = {
  arcpay: {
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
};

// =============================================================================
// Table 2: Store (provider + method) -> UCP handler ID
// =============================================================================

type StoreKey = `${PaymentProviderName}:${PaymentMethod}`;

const storeToUCPMapping: Record<StoreKey, string | undefined> = {
  "arcpay:wallet": "arcpay",
  "arcpay:card": undefined,
  "stripe:card": undefined,
  "stripe:wallet": undefined,
};

// =============================================================================
// Table 3: UCP handler ID -> Store (provider + method)
// =============================================================================

type StorePaymentInfo = {
  provider: PaymentProviderName;
  method: PaymentMethod;
};

const ucpToStoreMapping: Record<string, StorePaymentInfo> = {
  arcpay: { provider: "arcpay", method: "wallet" },
};

// =============================================================================
// Functions
// =============================================================================

/**
 * Maps a store PaymentProvider to UCP PaymentHandlerResponse array.
 * Returns handlers only for provider+method combinations that have explicit mappings.
 */
export const mapPaymentProviderToUCPHandlers = (
  provider: PaymentProvider
): PaymentHandlerResponse[] => {
  const handlers: PaymentHandlerResponse[] = [];

  for (const method of provider.supportedMethods) {
    const key: StoreKey = `${provider.provider}:${method}`;
    const handlerId = storeToUCPMapping[key];

    if (handlerId && ucpHandlers[handlerId]) {
      handlers.push(ucpHandlers[handlerId]);
    }
  }

  return handlers;
};

/**
 * Resolves a UCP handler ID to store PaymentProviderName and PaymentMethod.
 * Returns undefined if the handler ID is not mapped.
 */
export const resolveUCPHandlerIdToStore = (
  handlerId: string
): StorePaymentInfo | undefined => {
  return ucpToStoreMapping[handlerId];
};

/**
 * Gets a UCP handler by its ID.
 * Returns undefined if the handler ID is not found.
 */
export const getUCPHandler = (
  handlerId: string
): PaymentHandlerResponse | undefined => {
  return ucpHandlers[handlerId];
};
