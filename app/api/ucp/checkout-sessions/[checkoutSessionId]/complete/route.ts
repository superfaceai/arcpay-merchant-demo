import { z } from "zod";
import { headers } from "next/headers";
import { withValidation } from "@/app/api/validation";
import {
  CompleteCheckoutRequest,
  CompleteCheckoutResponse,
} from "@/app/ucp/schema";
import {
  makeUCPValidationErrorResponse,
  getCheckoutCapabilities,
} from "@/app/ucp/utils";
import { validateUCPAgentHeader } from "@/app/ucp/agent-header";
import {
  mapCartToUCPCheckoutSession,
  mapUCPPaymentDataToPayment,
} from "@/app/ucp/mapping";
import { completeCart } from "@/app/store/actions/complete-cart";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Complete Checkout Session
export const POST = withValidation(
  {
    body: CompleteCheckoutRequest,
    params: z.object({ checkoutSessionId: z.string() }),
  },
  async (rawRequest, { body, params }) => {
    // Validate UCP-Agent header
    const agentValidation = validateUCPAgentHeader(rawRequest);
    if (agentValidation instanceof Response) {
      return agentValidation;
    }

    const { checkoutSessionId } = await params;

    const result = await completeCart({
      cartId: checkoutSessionId,
      payment: mapUCPPaymentDataToPayment(body.payment_data),
    });

    // Handle error cases according to UCP spec
    if (result.kind === "not_found") {
      return Response.json(
        {
          status: "requires_escalation",
          messages: [
            {
              type: "error",
              code: "not_found",
              content_type: "plain",
              content: "Checkout session not found",
              severity: "requires_buyer_input",
            },
          ],
        },
        { status: 404 }
      );
    }

    if (result.kind === "cancelled_cannot_complete") {
      return Response.json(
        {
          status: "canceled",
          messages: [
            {
              type: "error",
              code: "cancelled",
              content_type: "plain",
              content:
                "Checkout session cannot be completed because it has been cancelled",
              severity: "requires_buyer_input",
            },
          ],
        },
        { status: 405 }
      );
    }

    if (result.kind === "already_completed") {
      // According to UCP spec, return 200 with the completed checkout session
      // The cart should already be in completed status
      const host = (await headers()).get("host");
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const baseUrl = `${protocol}://${host}`;

      // Load the cart and find the associated order
      const { loadCart } = await import("@/app/store/db/cart");
      const { listOrders } = await import("@/app/store/db/order");
      const cart = await loadCart(checkoutSessionId);

      if (!cart) {
        return Response.json(
          {
            status: "requires_escalation",
            messages: [
              {
                type: "error",
                code: "not_found",
                content_type: "plain",
                content: "Checkout session not found",
                severity: "requires_buyer_input",
              },
            ],
          },
          { status: 404 }
        );
      }

      // Find order by cartId
      const orders = await listOrders();
      const order = orders.find((o) => o.cartId === cart.id);

      const paymentProvider = await getPaymentProvider();
      const fulfillmentOptions = await getFulfillmentOptions(cart);
      const { taxRate } = await getTax(cart.fulfillmentAddress);

      const checkoutSession = mapCartToUCPCheckoutSession({
        cart,
        paymentProvider,
        fulfillmentOptions,
        taxRate,
        baseUrl,
        orderId: order?.id,
      });

      const response: CompleteCheckoutResponse = {
        ...checkoutSession,
        ucp: {
          version: "2026-01-11",
          capabilities: getCheckoutCapabilities(),
        },
      };

      return Response.json(response, { status: 200 });
    }

    if (result.kind === "not_ready_for_completion") {
      return Response.json(
        {
          status: "incomplete",
          messages: [
            {
              type: "error",
              code: "missing",
              content_type: "plain",
              content:
                "Checkout session is not ready for completion, please provide the missing information",
              severity: "recoverable",
            },
          ],
        },
        { status: 400 }
      );
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
      orderId: result.order?.id,
    });

    const response: CompleteCheckoutResponse = {
      ...checkoutSession,
      ucp: {
        version: "2026-01-11",
        capabilities: getCheckoutCapabilities(),
      },
    };

    return Response.json(response, {
      status: 200,
    });
  },
  makeUCPValidationErrorResponse
);
