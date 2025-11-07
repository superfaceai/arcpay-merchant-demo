import { z } from "zod";
import { withValidation } from "@/app/api/validation";

import {
  GetCheckoutSessionResponse,
  ResponseError,
  UpdateCheckoutSessionRequest,
  UpdateCheckoutSessionResponse,
} from "@/app/acp/schema";
import {
  mapACPBuyerToCustomer,
  mapCartToCheckoutSession,
  mapACPAddressToAddress,
} from "@/app/acp/mapping";
import { loadCart } from "@/app/store/db/cart";
import { makeACPValidationErrorResponse } from "@/app/acp/utils";
import { updateCart } from "@/app/store/actions/update-cart";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Update Checkout Session
export const POST = withValidation(
  {
    body: UpdateCheckoutSessionRequest,
    params: z.object({ checkoutSessionId: z.string() }),
  },
  async (rawRequest, { body, params }) => {
    const { checkoutSessionId } = await params;

    const result = await updateCart({
      cartId: checkoutSessionId,
      items: body.items?.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      })),
      customer: body.buyer ? mapACPBuyerToCustomer(body.buyer) : undefined,
      fulfillmentAddress: body.fulfillment_address
        ? mapACPAddressToAddress(body.fulfillment_address)
        : undefined,
      fulfillmentChoiceId: body.fulfillment_option_id,
    });

    if (
      result.kind === "not_found" ||
      result.kind === "cancelled_cannot_update" ||
      result.kind === "completed_cannot_update"
    ) {
      const message =
        result.kind === "not_found"
          ? "Checkout session not found"
          : result.kind === "cancelled_cannot_update"
          ? "Checkout session cannot be updated because it has been cancelled"
          : "Checkout session cannot be updated because it has been completed";

      return Response.json(
        ResponseError.parse({
          type: "invalid_request",
          code: "invalid_payload",
          message,
        }),
        { status: result.kind === "not_found" ? 404 : 405 }
      );
    }

    if (result.kind === "invalid_product_id") {
      return Response.json(
        ResponseError.parse({
          type: "invalid_request",
          code: "invalid_payload",
          message: `Product '${result.productId}' not found`,
          param: `$.items[${result.itemIndex}].id`,
        }),
        { status: 400 }
      );
    }
    if (result.kind === "invalid_fulfillment_choice_id") {
      return Response.json(
        ResponseError.parse({
          type: "invalid_request",
          code: "invalid_payload",
          message: `Fulfillment choice '${result.fulfillmentChoiceId}' is invalid`,
          param: `$.fulfillment_option_id`,
        }),
        { status: 400 }
      );
    }
    const paymentProvider = await getPaymentProvider();
    const fulfillmentOptions = await getFulfillmentOptions(result.cart);
    const { taxRate } = await getTax(result.cart.fulfillmentAddress);

    return Response.json(
      UpdateCheckoutSessionResponse.parse(
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

// Get Checkout Session
export const GET = async (
  rawRequest: Request,
  { params }: { params: Promise<{ checkoutSessionId: string }> }
) => {
  const { checkoutSessionId } = await params;

  const cart = await loadCart(checkoutSessionId);

  if (!cart) {
    return Response.json(
      ResponseError.parse({
        type: "invalid_request",
        code: "invalid_payload",
        message: "Checkout session not found",
      }),
      { status: 404 }
    );
  }

  const paymentProvider = await getPaymentProvider();
  const fulfillmentOptions = await getFulfillmentOptions(cart);
  const { taxRate } = await getTax(cart.fulfillmentAddress);

  return Response.json(
    GetCheckoutSessionResponse.parse(
      mapCartToCheckoutSession({
        cart,
        paymentProvider,
        fulfillmentOptions,
        taxRate,
      })
    ),
    {
      status: 200,
    }
  );
};
