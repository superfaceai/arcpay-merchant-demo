import z from "zod";
import {
  CompleteCheckoutSessionRequest,
  CompleteCheckoutSessionResponse,
  ResponseError,
} from "@/app/acp/schema";
import {
  mapACPBuyerToCustomer,
  mapACPPaymentDataToPayment,
  mapCartToCheckoutSession,
} from "@/app/acp/mapping";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { makeACPValidationErrorResponse } from "@/app/acp/utils";
import { withValidation } from "@/app/api/validation";
import { completeCart } from "@/app/store/actions/complete-cart";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Complete Checkout Session
export const POST = withValidation(
  {
    body: CompleteCheckoutSessionRequest,
    params: z.object({ checkoutSessionId: z.string() }),
  },
  async (rawRequest, { body, params }) => {
    const { checkoutSessionId } = await params;

    const result = await completeCart({
      cartId: checkoutSessionId,
      customer: body.buyer ? mapACPBuyerToCustomer(body.buyer) : undefined,
      payment: mapACPPaymentDataToPayment(body.payment_data),
    });

    if (
      result.kind === "not_found" ||
      result.kind === "cancelled_cannot_complete" ||
      result.kind === "already_completed"
    ) {
      const message =
        result.kind === "not_found"
          ? "Checkout session not found"
          : result.kind === "cancelled_cannot_complete"
          ? "Checkout session cannot be completed because it has been cancelled"
          : "Checkout session has already been completed";

      return Response.json(
        ResponseError.parse({
          type: "invalid_request",
          code: "invalid_payload",
          message,
        }),
        { status: result.kind === "not_found" ? 404 : 405 }
      );
    }

    if (result.kind === "not_ready_for_completion") {
      return Response.json(
        ResponseError.parse({
          type: "invalid_request",
          code: "invalid_payload",
          message:
            "Checkout session is not ready for completion, please provide the missing information",
          param: "$.messages",
        }),
        { status: 400 }
      );
    }

    const paymentProvider = await getPaymentProvider();
    const fulfillmentOptions = await getFulfillmentOptions(result.cart);
    const { taxRate } = await getTax(result.cart.fulfillmentAddress);

    return Response.json(
      CompleteCheckoutSessionResponse.parse(
        mapCartToCheckoutSession({
          cart: result.cart,
          paymentProvider,
          fulfillmentOptions,
          taxRate,
        })
      ),
      {
        status: 200,
      }
    );
  },
  makeACPValidationErrorResponse
);
