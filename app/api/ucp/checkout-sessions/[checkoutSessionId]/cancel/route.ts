import { headers } from "next/headers";
import { CancelCheckoutResponse } from "@/app/ucp/schema";
import { getCheckoutCapabilities } from "@/app/ucp/utils";
import { validateUCPAgentHeader } from "@/app/ucp/agent-header";
import { mapCartToUCPCheckoutSession } from "@/app/ucp/mapping";
import { cancelCart } from "@/app/store/actions/cancel-cart";
import { loadCart } from "@/app/store/db/cart";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Cancel Checkout Session
export const POST = async (
  rawRequest: Request,
  { params }: { params: Promise<{ checkoutSessionId: string }> }
) => {
  // Validate UCP-Agent header
  const agentValidation = validateUCPAgentHeader(rawRequest);
  if (agentValidation instanceof Response) {
    return agentValidation;
  }

  const { checkoutSessionId } = await params;

  const result = await cancelCart({
    cartId: checkoutSessionId,
  });

  if (result.kind === "not_found") {
    return Response.json(
      {
        status: "requires_escalation",
        messages: [
          {
            type: "error",
            code: "invalid",
            content_type: "plain",
            content: "Checkout session not found",
            severity: "requires_buyer_input",
          },
        ],
      },
      { status: 404 }
    );
  }

  if (result.kind === "completed_cannot_cancel") {
    return Response.json(
      {
        status: "requires_escalation",
        messages: [
          {
            type: "error",
            code: "invalid",
            content_type: "plain",
            content: "Checkout session cannot be cancelled because it has been completed",
            severity: "requires_buyer_input",
          },
        ],
      },
      { status: 405 }
    );
  }

  if (result.kind === "already_cancelled") {
    // For already cancelled, we need to load the cart
    const cart = await loadCart(checkoutSessionId);
    if (!cart) {
      return Response.json(
        {
          status: "requires_escalation",
          messages: [
            {
              type: "error",
              code: "invalid",
              content_type: "plain",
              content: "Checkout session not found",
              severity: "requires_buyer_input",
            },
          ],
        },
        { status: 404 }
      );
    }

    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const paymentProvider = await getPaymentProvider();
    const fulfillmentOptions = await getFulfillmentOptions(cart);
    const { taxRate } = await getTax(cart.fulfillmentAddress);

    const checkoutSession = mapCartToUCPCheckoutSession({
      cart,
      paymentProvider,
      fulfillmentOptions,
      taxRate,
      baseUrl,
    });

    const response: CancelCheckoutResponse = {
      ...checkoutSession,
      ucp: {
        version: "2026-01-11",
        capabilities: getCheckoutCapabilities(),
      },
    };

    return Response.json(response, {
      status: 200,
    });
  }

  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const paymentProvider = await getPaymentProvider();
  const fulfillmentOptions = await getFulfillmentOptions(result.cart);
  const { taxRate } = await getTax(result.cart.fulfillmentAddress);

  const checkoutSession = mapCartToUCPCheckoutSession({
    cart: result.cart,
    paymentProvider,
    fulfillmentOptions,
    taxRate,
    baseUrl,
  });

  const response: CancelCheckoutResponse = {
    ...checkoutSession,
    ucp: {
      version: "2026-01-11",
      capabilities: getCheckoutCapabilities(),
    },
  };

  return Response.json(response, {
    status: 200,
  });
};

