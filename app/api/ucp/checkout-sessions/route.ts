import { z } from "zod";
import { headers } from "next/headers";
import { withValidation } from "@/app/api/validation";
import {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
} from "@/app/ucp/schema";
import { makeUCPValidationErrorResponse, getCheckoutCapabilities } from "@/app/ucp/utils";
import { validateUCPAgentHeader } from "@/app/ucp/agent-header";
import {
  mapUCPBuyerToCustomer,
  mapCartToUCPCheckoutSession,
  mapUCPPostalAddressToStoreAddress,
  mapUCPPaymentRequestToPayment,
} from "@/app/ucp/mapping";
import { Address as StoreAddress } from "@/app/store/objects/address";
import { updateCart } from "@/app/store/actions/update-cart";
import { getFulfillmentOptions } from "@/app/store/actions/get-fulfillment-options";
import { getTax } from "@/app/store/actions/get-tax";
import { getPaymentProvider } from "@/app/store/actions/get-payment-provider";

// Create Checkout Session
export const POST = withValidation(
  { body: CreateCheckoutRequest, params: z.object({}) },
  async (rawRequest, { body }) => {
    // Validate UCP-Agent header
    const agentValidation = validateUCPAgentHeader(rawRequest);
    if (agentValidation instanceof Response) {
      return agentValidation;
    }

    // Handle fulfillment extension - extract address from destinations
    let fulfillmentAddress: StoreAddress | undefined = undefined;
    let fulfillmentChoiceId: string | undefined = undefined;

    if (body.fulfillment?.methods && body.fulfillment.methods.length > 0) {
      const method = body.fulfillment.methods[0];
      
      // Extract address from destinations array (first destination for shipping)
      if (method.destinations && method.destinations.length > 0) {
        const destination = method.destinations[0];
        
        // Check if it's a shipping destination (has PostalAddress fields)
        if ('street_address' in destination) {
          fulfillmentAddress = mapUCPPostalAddressToStoreAddress(destination);
        }
        // Or retail location with address field
        else if ('address' in destination && destination.address) {
          fulfillmentAddress = mapUCPPostalAddressToStoreAddress(destination.address);
        }
      }
      
      // Extract selected fulfillment option from groups
      if (method.groups && method.groups.length > 0) {
        for (const group of method.groups) {
          if (group.selected_option_id) {
            fulfillmentChoiceId = group.selected_option_id;
            break;
          }
        }
      }
    }

    // Extract payment from request if instrument with credential is provided
    const payment = mapUCPPaymentRequestToPayment(body.payment);

    // Map line_items to items format expected by updateCart
    const result = await updateCart({
      items: body.line_items.map((lineItem) => ({
        variantId: lineItem.item.id,
        quantity: lineItem.quantity,
      })),
      customer: body.buyer ? mapUCPBuyerToCustomer(body.buyer) : undefined,
      fulfillmentAddress,
      fulfillmentChoiceId,
      sourceProtocol: "ucp",
      payment,
    });

    if (
      result.kind === "not_found" ||
      result.kind === "cancelled_cannot_update" ||
      result.kind === "completed_cannot_update"
    ) {
      return Response.json(
        {
          status: "requires_escalation",
          messages: [
            {
              type: "error",
              code: "invalid",
              content_type: "plain",
              content:
                result.kind === "not_found"
                  ? "Checkout session not found"
                  : result.kind === "cancelled_cannot_update"
                  ? "Checkout session cannot be updated because it has been cancelled"
                  : "Checkout session cannot be updated because it has been completed",
              severity: "requires_buyer_input",
            },
          ],
        },
        { status: result.kind === "not_found" ? 404 : 405 }
      );
    }

    if (result.kind === "invalid_product_id") {
      return Response.json(
        {
          status: "requires_buyer_input",
          messages: [
            {
              type: "error",
              code: "invalid",
              path: `$.line_items[${result.itemIndex}].item.id`,
              content_type: "plain",
              content: `Product '${result.productId}' not found`,
              severity: "requires_buyer_input",
            },
          ],
        },
        { status: 400 }
      );
    }

    if (result.kind === "invalid_fulfillment_choice_id") {
      return Response.json(
        {
          status: "requires_buyer_input",
          messages: [
            {
              type: "error",
              code: "invalid",
              path: "$.fulfillment_option_id",
              content_type: "plain",
              content: `Fulfillment choice '${result.fulfillmentChoiceId}' is invalid`,
              severity: "requires_buyer_input",
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
    });

    const response: CreateCheckoutResponse = {
      ...checkoutSession,
      ucp: {
        version: "2026-01-11",
        capabilities: getCheckoutCapabilities(),
      },
    };

    return Response.json(response, {
      status: 201,
    });
  },
  makeUCPValidationErrorResponse
);

