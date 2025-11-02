import { z } from "zod";
import { withValidation } from "@/app/api/validation";
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  ResponseError,
} from "@/app/acp/schema";
import { makeACPValidationErrorResponse } from "@/app/acp/utils";
import {
  mapACPAddressToAddress,
  mapACPBuyerToCustomer,
  mapCartToCreateCheckoutSessionResponse,
} from "@/app/acp/mapping";

import { updateCart } from "@/app/store/actions/update-cart";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Create Checkout Session
export const POST = withValidation(
  { body: CreateCheckoutSessionRequest, params: z.undefined() },
  async (rawRequest, { body }) => {
    const result = await updateCart({
      items: body.items.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      })),
      fulfillmentAddress: body.fulfillment_address
        ? mapACPAddressToAddress(body.fulfillment_address)
        : undefined,
      customer: body.buyer ? mapACPBuyerToCustomer(body.buyer) : undefined,
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
      CreateCheckoutSessionResponse.parse(
        mapCartToCreateCheckoutSessionResponse({
          cart: result.cart,
          paymentProvider,
          fulfillmentOptions,
          taxRate,
        })
      ),
      {
        status: 201,
      }
    );
  },
  makeACPValidationErrorResponse
);
