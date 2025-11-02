import { CancelCheckoutSessionResponse, ResponseError } from "@/app/acp/schema";
import { mapCartToCheckoutSession } from "@/app/acp/mapping";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { cancelCart } from "@/app/store/actions/cancel-cart";

// Cancel Checkout Session
export const POST = async (
  rawRequest: Request,
  { params }: { params: { checkoutSessionId: string } }
) => {
  const { checkoutSessionId } = await params;

  const result = await cancelCart({ cartId: checkoutSessionId });

  if (result.kind === "not_found") {
    return Response.json(
      ResponseError.parse({
        type: "not_found",
        code: "not_found",
        message: "Checkout session not found",
      }),
      { status: 404 }
    );
  }

  if (result.kind === "completed_cannot_cancel") {
    return Response.json(
      ResponseError.parse({
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          "Checkout session cannot be cancelled because it has already been completed",
      }),
      { status: 405 }
    );
  }

  if (result.kind === "already_cancelled") {
    return Response.json(
      ResponseError.parse({
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Checkout session has already been cancelled",
      }),
      { status: 405 }
    );
  }

  const fulfillmentOptions = await getFulfillmentOptions(result.cart);
  const { taxRate } = await getTax(result.cart.fulfillmentAddress);

  return Response.json(
    CancelCheckoutSessionResponse.parse(
      mapCartToCheckoutSession({
        cart: result.cart,
        fulfillmentOptions,
        taxRate,
      })
    ),
    {
      status: 200,
    }
  );
};
