import { Cart } from "./cart";
import { Address } from "./address";
import { Currency } from "./currency";
import { ProductVariant } from "./product";
import { FulfillmentOption } from "./fulfillment-option";
import { Payment } from "./payment";

export type OrderDiscount = {
  target: "line_item" | "shipping";
  value: number;
};

export type OrderLineItem = {
  title: string;
  quantity: number;
  originalPrice: number;
  totalDiscount: number;
  subtotalPrice: number;
  totalTax: number;
  totalPrice: number;
  variantId: ProductVariant["id"];
  fulfillmentType: FulfillmentOption["type"];
};

export type Order = {
  id: string;
  customerEmail: string;
  customerPhone?: string;
  lineItems: OrderLineItem[];
  discounts: OrderDiscount[];
  subtotalPrice: number;
  totalShippingPrice: number;
  totalTax: number;
  totalPrice: number;
  currency: Currency;
  status: "created" | "fulfilled" | "canceled";
  cartId: Cart["id"];
  payment: Payment;
  financialStatus:
    | "authorized"
    | "paid"
    | "partially_paid"
    | "partially_refunded"
    | "pending"
    | "refunded"
    | "voided";
  fulfillmentStatus:
    | "fulfilled"
    | "in_progress"
    | "on_hold"
    | "open"
    | "partially_fulfilled"
    | "pending_fulfillment"
    | "restocked"
    | "scheduled"
    | "unfulfilled";
  billingAddress?: Address;
  fulfillmentChoiceId?: FulfillmentOption["id"];
  shippingAddress?: Address;
  processedAt: string;
  canceledAt?: string;
};
