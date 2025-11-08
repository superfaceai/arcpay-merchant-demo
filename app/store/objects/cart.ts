import { Currency } from "./currency";
import { Address } from "./address";
import { FulfillmentOption } from "./fulfillment-option";
import { OrderLineItem } from "./order";

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type CartMessage =
  | {
      kind: "out_of_stock";
      productId: string;
      itemIndex: number;
    }
  | {
      kind: "quantity_not_available";
      productId: string;
      itemIndex: number;
      maxQuantity: number;
    }
  | {
      kind: "missing_fulfillment_address";
    }
  | {
      kind: "payment_declined";
      reason?: string;
    };

export type Cart = {
  id: string;
  customer?: Customer;
  items: OrderLineItem[];
  status: "shopping" | "checkout" | "completed" | "cancelled";
  cancelledAt?: string;
  completedAt?: string;
  currency: Currency;
  fulfillmentAddress?: Address;
  fulfillmentChoiceId?: FulfillmentOption["id"];
  totalDiscount: number;
  subtotalPrice: number;
  totalShippingPrice: number;
  totalTax: number;
  totalPrice: number;
  messages: CartMessage[];
};
