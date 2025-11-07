import { Cart, CartMessage, Customer } from "@/app/store/objects/cart";

import {
  CheckoutSession,
  CreateCheckoutSessionResponse,
  Address as ACPAddress,
  Buyer,
  FulfillmentOption as ACPFulfillmentOption,
  Message as ACPMessage,
  PaymentData,
  PaymentProvider as ACPPaymentProvider,
} from "./schema";
import { Address } from "../store/objects/address";
import { FulfillmentOption } from "../store/objects/fulfillment-option";
import { amount } from "../lib/amount";
import { deliveryDate } from "../store/actions/delivery-date";
import { Payment, PaymentProvider } from "../store/objects/payment";

export const mapCartToCheckoutSession = ({
  cart,
  fulfillmentOptions,
  paymentProvider,
  taxRate,
}: {
  cart: Cart;
  paymentProvider: PaymentProvider;
  fulfillmentOptions: FulfillmentOption[];
  taxRate: number;
}): CheckoutSession => {
  return {
    id: cart.id,
    ...(cart.customer && { buyer: mapCustomerToACP(cart.customer) }),
    payment_provider: mapPaymentProviderToACP(paymentProvider),
    status: STATUS_MAP[cart.status],
    currency: cart.currency,
    line_items: cart.items.map((item) => ({
      id: item.variantId,
      item: {
        id: item.variantId,
        quantity: item.quantity,
      },
      base_amount: item.originalPrice,
      discount: item.totalDiscount,
      subtotal: item.subtotalPrice,
      tax: item.totalTax,
      total: item.totalPrice,
    })),
    ...(cart.fulfillmentAddress && {
      fulfillment_address: mapAddressToACP(cart.fulfillmentAddress),
    }),
    fulfillment_options: mapFulfillmentOptionsToACP(
      fulfillmentOptions,
      taxRate
    ),
    fulfillment_option_id: cart.fulfillmentChoiceId,
    totals: [
      {
        type: "items_base_amount",
        display_text: "Item(s) total",
        amount: cart.items.reduce(
          (acc, item) => acc + item.originalPrice * item.quantity,
          0
        ),
      },
      {
        type: "discount",
        display_text: "Discount",
        amount: cart.totalDiscount,
      },
      {
        type: "subtotal",
        display_text: "Subtotal",
        amount: cart.subtotalPrice,
      },
      {
        type: "fulfillment",
        display_text: "Shipping",
        amount: cart.totalShippingPrice,
      },
      {
        type: "tax",
        display_text: "Tax",
        amount: cart.totalTax,
      },
      {
        type: "total",
        display_text: "Total",
        amount: cart.totalPrice,
      },
    ],
    messages: mapCartMessagesToACP(cart.messages),
    links: [],
  };
};

const mapCustomerToACP = (customer: Customer): Buyer => {
  return {
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone_number: customer.phone,
  };
};

export const mapACPBuyerToCustomer = (buyer: Buyer): Customer => {
  return {
    firstName: buyer.first_name,
    lastName: buyer.last_name,
    email: buyer.email,
    phone: buyer.phone_number,
  };
};

const mapAddressToACP = (address: Address): ACPAddress => {
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

export const mapACPAddressToAddress = (address: ACPAddress): Address => {
  return {
    name: address.name,
    address1: address.line_one,
    address2: address.line_two,
    city: address.city,
    state: address.state,
    country: address.country,
    zip: address.postal_code,
    phone: address.phone_number,
  };
};

const STATUS_MAP: Record<Cart["status"], CheckoutSession["status"]> = {
  shopping: "not_ready_for_payment",
  checkout: "ready_for_payment",
  completed: "completed",
  cancelled: "canceled",
};

const mapCartMessagesToACP = (messages: CartMessage[]): ACPMessage[] =>
  messages.map((message) => {
    if (message.kind === "missing_fulfillment_address") {
      return {
        type: "info",
        param: "$.fulfillment_address",
        content_type: "plain",
        content:
          "Please provide a fulfillment address to continue with the checkout.",
      };
    }
    if (message.kind === "out_of_stock") {
      return {
        type: "error",
        code: "out_of_stock",
        param: `$.line_items[${message.itemIndex}].id`,
        content_type: "plain",
        content: `Product '${message.productId}' is currently out of stock.`,
      };
    }
    if (message.kind === "quantity_not_available") {
      return {
        type: "error",
        code: "invalid",
        param: `$.line_items[${message.itemIndex}].id`,
        content_type: "plain",
        content: `Product '${message.productId}' is not available in the requested quantity. Please adjust the quantity to ${message.maxQuantity} or less`,
      };
    }

    throw new Error(`Unknown message kind: ${message}`);
  });

const mapFulfillmentOptionsToACP = (
  fulfillmentOptions: FulfillmentOption[],
  taxRate: number
): ACPFulfillmentOption[] =>
  fulfillmentOptions.map((fo) => {
    if (fo.type === "shipping") {
      const { earliest, latest } = deliveryDate({
        deliveryMinDays: fo.estimatedDeliveryMinDays,
        deliveryMaxDays: fo.estimatedDeliveryMaxDays,
        sendAtHour: 10,
        receiveAtHour: 18,
      });

      return {
        type: "shipping",
        id: fo.id,
        title: fo.title,
        subtitle: fo.subtitle,
        carrier_info: fo.carrier,
        earliest_delivery_time: earliest.toISOString(),
        latest_delivery_time: latest.toISOString(),
        subtotal: fo.basePrice,
        tax: amount(fo.basePrice * taxRate),
        total: amount(fo.basePrice + fo.basePrice * taxRate),
      };
    }

    return {
      type: "digital",
      id: fo.id,
      title: fo.title,
      subtitle: fo.subtitle,
      subtotal: fo.basePrice,
      tax: amount(fo.basePrice * taxRate),
      total: amount(fo.basePrice + fo.basePrice * taxRate),
    };
  });

export const mapPaymentProviderToACP = (
  paymentProvider: PaymentProvider
): ACPPaymentProvider => {
  return {
    provider: paymentProvider.provider,
    supported_payment_methods: paymentProvider.supportedMethods,
  };
};

export const mapACPPaymentDataToPayment = (
  paymentData: PaymentData
): Payment => {
  if (paymentData.provider === "stripe") {
    return {
      type: "delegated_payment",
      provider: "stripe",
      token: paymentData.token,
      billingAddress: paymentData.billing_address
        ? mapACPAddressToAddress(paymentData.billing_address)
        : undefined,
    };
  }
  if (paymentData.provider === "arc_pay") {
    // Not in ACP specification
    return {
      type: "delegated_payment",
      provider: "arc_pay",
      token: paymentData.token,
      billingAddress: paymentData.billing_address
        ? mapACPAddressToAddress(paymentData.billing_address)
        : undefined,
    };
  }

  throw new Error(`Unknown payment type: ${paymentData.provider}`);
};
