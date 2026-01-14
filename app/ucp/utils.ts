import { ErrorResponse, Message, CapabilityResponse } from "./schema";

export const makeUCPErrorResponse = (
  errors: Array<{ paramPath: PropertyKey[]; message: string }>
): Response => {
  const messages: Message[] = errors.map((error) => ({
    type: "error" as const,
    code: "invalid",
    path:
      error.paramPath.length > 0
        ? `$.${error.paramPath.join(".")}`
        : undefined,
    content_type: "plain" as const,
    content: error.message,
    severity: "requires_buyer_input" as const,
  }));

  const errorResponse: ErrorResponse = {
    status: "requires_buyer_input",
    messages,
  };

  return Response.json(errorResponse, {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const makeUCPValidationErrorResponse = (
  errors: Array<{ paramPath: PropertyKey[]; message: string }>
): Response => {
  return makeUCPErrorResponse(errors);
};

// Helper function to get checkout response capabilities
export const getCheckoutCapabilities = (): CapabilityResponse[] => [
  {
    name: "dev.ucp.shopping.checkout",
    version: "2026-01-11",
    spec: "https://ucp.dev/specification/checkout/",
    schema: "https://ucp.dev/schemas/shopping/checkout.json",
  },
  {
    name: "dev.ucp.shopping.fulfillment",
    version: "2026-01-11",
    spec: "https://ucp.dev/specification/fulfillment/",
    schema: "https://ucp.dev/schemas/shopping/checkout.json#fulfillment",
    extends: "dev.ucp.shopping.checkout",
  },
];

