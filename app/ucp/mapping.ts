import { Cart, CartMessage } from "@/app/store/objects/cart";
import { Address as StoreAddress } from "@/app/store/objects/address";
import { FulfillmentOption as StoreFulfillmentOption } from "@/app/store/objects/fulfillment-option";
import {
  PaymentProvider as StorePaymentProvider,
  Payment,
  PaymentProviderName,
} from "@/app/store/objects/payment";
import { amount } from "@/app/lib/amount";
import { deliveryDate } from "@/app/store/actions/delivery-date";
import {
  Address,
  Buyer,
  CheckoutSession,
  LineItem,
  Total,
  FulfillmentOption,
  PaymentProvider,
  Message,
  FulfillmentResponse,
  FulfillmentMethod,
  ShippingDestinationResponse,
  FulfillmentGroup,
  FulfillmentOptionResponse,
  PaymentResponse,
  Link,
  OrderConfirmation,
  PostalAddress,
  PaymentInstrument,
} from "./schema";
import { Customer } from "@/app/store/objects/cart";

export const mapStoreAddressToUCPAddress = (
  address: StoreAddress | undefined
): Address | undefined => {
  if (!address) return undefined;
  return {
    name: address.name,
    line_one: address.address1,
    line_two: address.address2,
    city: address.city,
    state: address.state,
    country: address.country,
    postal_code: address.zip,
    phone_number: address.phone,
  };
};

export const mapUCPAddressToStoreAddress = (
  address: Address | undefined
): StoreAddress | undefined => {
  if (!address) return undefined;
  return {
    name: address.name || "",
    address1: address.line_one,
    address2: address.line_two,
    city: address.city,
    state: address.state,
    country: address.country,
    zip: address.postal_code,
    phone: address.phone_number,
  };
};

export const mapUCPPostalAddressToStoreAddress = (
  address: PostalAddress | undefined
): StoreAddress | undefined => {
  if (!address) return undefined;
  return {
    name: address.full_name || `${address.first_name || ""} ${address.last_name || ""}`.trim() || "",
    address1: address.street_address || "",
    address2: address.extended_address,
    city: address.address_locality || "",
    state: address.address_region || "",
    country: address.address_country || "",
    zip: address.postal_code || "",
    phone: address.phone_number,
  };
};

export const mapCustomerToUCPBuyer = (
  customer: Customer | undefined
): Buyer | undefined => {
  if (!customer || Object.keys(customer).length === 0) return undefined;
  return {
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone_number: customer.phone,
  };
};

export const mapUCPBuyerToCustomer = (
  buyer: Buyer | undefined
): Customer | undefined => {
  if (!buyer || Object.keys(buyer).length === 0) return undefined;
  return {
    firstName: buyer.first_name || "",
    lastName: buyer.last_name || "",
    email: buyer.email || "",
    phone: buyer.phone_number,
  };
};

export const mapStoreFulfillmentOptionToUCP = (
  option: StoreFulfillmentOption,
  taxRate: number
): FulfillmentOption => {
  if (option.type === "shipping") {
    const { earliest, latest } = deliveryDate({
      deliveryMinDays: option.estimatedDeliveryMinDays,
      deliveryMaxDays: option.estimatedDeliveryMaxDays,
      sendAtHour: 10,
      receiveAtHour: 18,
    });

    return {
      type: "shipping",
      id: option.id,
      title: option.title,
      subtitle: option.subtitle,
      carrier_info: option.carrier,
      earliest_delivery_time: earliest.toISOString(),
      latest_delivery_time: latest.toISOString(),
      subtotal: amount(option.basePrice),
      tax: amount(option.basePrice * taxRate),
      total: amount(option.basePrice + option.basePrice * taxRate),
    };
  } else {
    return {
      type: "digital",
      id: option.id,
      title: option.title,
      subtitle: option.subtitle,
      subtotal: amount(option.basePrice),
      tax: amount(option.basePrice * taxRate),
      total: amount(option.basePrice + option.basePrice * taxRate),
    };
  }
};

export const mapStorePaymentProviderToUCP = (
  provider: StorePaymentProvider
): PaymentProvider => {
  return {
    provider: provider.provider,
    supported_payment_methods: provider.supportedMethods,
  };
};

export const mapCartMessageToUCPMessage = (
  message: CartMessage,
  itemIndex?: number
): Message => {
  switch (message.kind) {
    case "out_of_stock":
      return {
        type: "error",
        code: "out_of_stock",
        path:
          itemIndex !== undefined ? `$.line_items[${itemIndex}]` : undefined,
        content_type: "plain",
        content: `Product ${message.productId} is out of stock`,
        severity: "requires_buyer_input",
      };
    case "quantity_not_available":
      return {
        type: "error",
        code: "invalid",
        path:
          itemIndex !== undefined ? `$.line_items[${itemIndex}]` : undefined,
        content_type: "plain",
        content: `Only ${message.maxQuantity} units available for product ${message.productId}`,
        severity: "requires_buyer_input",
      };
    case "missing_fulfillment_address":
      return {
        type: "error",
        code: "missing",
        path: "$.fulfillment_address",
        content_type: "plain",
        content: "Fulfillment address is required",
        severity: "requires_buyer_input",
      };
    case "payment_declined":
      return {
        type: "error",
        code: "payment_declined",
        path: "$.payment_data",
        content_type: "plain",
        content: message.reason || "Payment was declined",
        severity: "requires_buyer_input", 
      };
    case "missing_buyer":
      return {
        type: "error",
        code: "missing",
        path: "$.buyer",
        content_type: "plain",
        content: "Buyer information is required",
        severity: "requires_buyer_input",
      };
    case "missing_buyer_email":
      return {
        type: "error",
        code: "missing",
        path: "$.buyer.email",
        content_type: "plain",
        content: "Buyer email is required",
        severity: "requires_buyer_input",
      };
  }
};

export const mapCartToUCPCheckoutSession = ({
  cart,
  fulfillmentOptions,
  paymentProvider,
  taxRate,
  baseUrl,
  orderId,
}: {
  cart: Cart;
  paymentProvider: StorePaymentProvider | undefined;
  fulfillmentOptions: StoreFulfillmentOption[];
  taxRate: number;
  baseUrl?: string;
  orderId?: string;
}): CheckoutSession => {
  const lineItems: LineItem[] = cart.items.map((item) => {
    const lineItemTotals: Total[] = [];

    // Subtotal (base amount before tax)
    const subtotal = amount(item.subtotalPrice);
    if (subtotal > 0) {
      lineItemTotals.push({
        type: "subtotal",
        amount: subtotal,
      });
    }

    // Discount (if any)
    if (item.totalDiscount > 0) {
      lineItemTotals.push({
        type: "discount",
        amount: amount(item.totalDiscount),
      });
    }

    // Tax (if any)
    if (item.totalTax > 0) {
      lineItemTotals.push({
        type: "tax",
        amount: amount(item.totalTax),
      });
    }

    // Total
    lineItemTotals.push({
      type: "total",
      amount: amount(item.totalPrice),
    });

    return {
      id: item.variantId, // Line item ID is just the product variant ID
      item: {
        id: item.variantId,
        title: item.title,
        price: amount(item.originalPrice),
        // image_url would require fetching product data
      },
      quantity: item.quantity,
      totals: lineItemTotals,
    };
  });

  const totals: Total[] = [
    {
      type: "subtotal",
      display_text: "Subtotal",
      amount: amount(cart.subtotalPrice),
    },
    {
      type: "fulfillment",
      display_text: "Shipping",
      amount: amount(cart.totalShippingPrice),
    },
    {
      type: "tax",
      display_text: "Tax",
      amount: amount(cart.totalTax),
    },
    {
      type: "total",
      display_text: "Total",
      amount: amount(cart.totalPrice),
    },
  ];

  const messages: Message[] = cart.messages.map((msg) => {
    const itemIndex = cart.items.findIndex(
      (item) =>
        (msg.kind === "out_of_stock" ||
          msg.kind === "quantity_not_available") &&
        item.variantId === (msg as { productId: string }).productId
    );
    return mapCartMessageToUCPMessage(
      msg,
      itemIndex >= 0 ? itemIndex : undefined
    );
  });

  // Map cart status to UCP checkout status
  // Check if there are errors that require escalation (non-recoverable errors)
  // const hasEscalationErrors = messages.some(
  //   (msg) => msg.type === "error" && msg.severity !== "recoverable"
  // );
  const hasEscalationErrors = false;

  const status =
    cart.status === "completed"
      ? "completed"
      : cart.status === "cancelled"
      ? "canceled"
      : hasEscalationErrors
      ? "requires_escalation"
      : cart.status === "checkout"
      ? "ready_for_complete"
      : "incomplete";

  // Map fulfillment extension
  const fulfillment: FulfillmentResponse | undefined = (() => {
    if (!cart.fulfillmentAddress || fulfillmentOptions.length === 0) {
      return undefined;
    }

    // Filter to only shipping methods (digital items don't need fulfillment)
    const shippingOptions = fulfillmentOptions.filter(
      (opt) => opt.type === "shipping"
    );

    if (shippingOptions.length === 0) {
      return undefined;
    }

    // Map address to shipping destination
    const shippingDestination: ShippingDestinationResponse = {
      id: "ful_dest_0", // Destination ID uses index within the list
      street_address: cart.fulfillmentAddress.address1,
      extended_address: cart.fulfillmentAddress.address2,
      address_locality: cart.fulfillmentAddress.city,
      address_region: cart.fulfillmentAddress.state,
      address_country: cart.fulfillmentAddress.country,
      postal_code: cart.fulfillmentAddress.zip,
    };

    // Map fulfillment options to groups
    const groups: FulfillmentGroup[] = [
      {
        id: "ful_package_0", // Group ID uses index within the list
        line_item_ids: lineItems.map((li) => li.id),
        selected_option_id: cart.fulfillmentChoiceId || undefined,
        options: shippingOptions.map((opt) => {
          const ucpOpt = mapStoreFulfillmentOptionToUCP(opt, taxRate);
          return {
            id: ucpOpt.id,
            title: ucpOpt.title,
            description: ucpOpt.subtitle || undefined,
            totals: [
              {
                type: "total" as const,
                display_text: "Shipping",
                amount: amount(ucpOpt.total),
              },
            ],
          } as FulfillmentOptionResponse;
        }),
      },
    ];

    const method: FulfillmentMethod = {
      id: "ful_method_0", // Method ID uses index within the list
      type: "shipping",
      line_item_ids: lineItems.map((li) => li.id),
      destinations: [shippingDestination],
      selected_destination_id: shippingDestination.id,
      groups,
    };

    return {
      methods: [method],
    };
  })();

  // Generate links for legal compliance
  const links: Link[] = baseUrl
    ? [
        {
          type: "terms_of_service",
          url: new URL("/terms-of-use", baseUrl).toString(),
          title: "Terms of Service",
        },
        {
          type: "privacy_policy",
          url: new URL("/privacy-policy", baseUrl).toString(),
          title: "Privacy Policy",
        },
        {
          type: "shipping_policy",
          url: new URL("/seller-shop-policies", baseUrl).toString(),
          title: "Shipping Policy",
        },
      ]
    : [];

  // Map payment provider to PaymentResponse
  const payment: PaymentResponse = paymentProvider
    ? {
        handlers: [
          {
            id: paymentProvider.provider,
            name: `ai.${paymentProvider.provider}.${paymentProvider.supportedMethods[0]}`,
            version: "2026-01-11",
            spec: `https://${paymentProvider.provider}.ai/docs`,
            config_schema: `https://${paymentProvider.provider}.ai/schemas/config.json`,
            instrument_schemas: [
              `https://${paymentProvider.provider}.ai/schemas/instrument.json`,
            ],
            config: {
              provider: paymentProvider.provider,
              supported_methods: paymentProvider.supportedMethods,
            },
          },
        ],
      }
    : {
        handlers: [],
      };

  // Calculate expires_at (6 hours from now if not set)
  const expiresAt = cart.completedAt
    ? undefined
    : new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

  // Generate continue_url if status requires escalation
  const continueUrl =
    status === "requires_escalation" && baseUrl
      ? new URL(`/checkout/${cart.id}`, baseUrl).toString()
      : undefined;

  // Map order confirmation if order exists
  const order: OrderConfirmation | undefined =
    orderId && baseUrl
      ? {
          id: orderId,
          permalink_url: new URL(`/orders/${orderId}`, baseUrl).toString(),
        }
      : undefined;

  return {
    id: cart.id,
    line_items: lineItems,
    buyer: mapCustomerToUCPBuyer(cart.customer),
    status,
    currency: cart.currency,
    totals,
    messages,
    links,
    expires_at: expiresAt,
    continue_url: continueUrl,
    payment,
    order,
    fulfillment,
  };
};

export const mapUCPPaymentDataToPayment = (
  paymentData: PaymentInstrument
): Payment => {
  const instrument: PaymentInstrument = paymentData;

  // Extract provider from handler_id (e.g., "ai.stripe.payment-handler" -> "stripe")
  // or "ai.arcpay.payment-handler" -> "arcpay"
  let provider: PaymentProviderName;
  if (instrument.handler_id.includes("stripe")) {
    provider = "stripe";
  } else if (instrument.handler_id.includes("arcpay")) {
    provider = "arcpay";
  } else {
    throw new Error(`Unknown payment handler: ${instrument.handler_id}`);
  }

  // Extract token from credential
  // For TokenCredentialResponse, the type field contains the token type identifier
  // For CardCredential, we might need to use a different approach
  let token: string;
  if (instrument.credential) {
    if (instrument.credential.type === "card") {
      // For card credentials, we might use the instrument id or a combination
      // In a real implementation, the token might be stored elsewhere or generated
      // For now, we'll use the instrument id as a fallback
      token = instrument.id;
    } else {
      // TokenCredentialResponse - use the type field as token identifier
      token = instrument.credential.type;
    }
  } else {
    // Fallback to instrument id if no credential
    token = instrument.id;
  }

  const payment: Payment = {
    type: "delegated_payment",
    provider,
    token,
    billingAddress: instrument.billing_address
      ? mapUCPPostalAddressToStoreAddress(instrument.billing_address)
      : undefined,
  };

  return payment;
};
