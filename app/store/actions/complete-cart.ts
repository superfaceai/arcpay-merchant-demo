import { Cart, Customer } from "@/app/store/objects/cart";
import { Order } from "@/app/store/objects/order";
import { Payment } from "@/app/store/objects/payment";
import { generateId } from "@/app/lib/generate-id";

import { loadCart, saveCart } from "../db/cart";
import { saveOrder } from "../db/order";
import { processPayment } from "./process-payment";

export const completeCart = async ({
  cartId,
  customer,
  payment,
}: {
  cartId: string;
  payment: Payment;
  customer?: Customer;
}): Promise<
  | { kind: "not_found" }
  | { kind: "cancelled_cannot_complete" }
  | { kind: "already_completed" }
  | { kind: "not_ready_for_completion" }
  | { kind: "completed"; cart: Cart; order: Order }
> => {
  const cart = await loadCart(cartId);

  if (!cart) {
    return { kind: "not_found" };
  }

  if (cart.status === "cancelled") {
    return { kind: "cancelled_cannot_complete" };
  }
  if (cart.status === "completed") {
    return { kind: "already_completed" };
  }
  if (cart.status === "shopping") {
    return { kind: "not_ready_for_completion" };
  }

  const completedCart: Cart = {
    ...cart,
    customer: customer ?? cart.customer,
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  const order: Order = {
    id: generateId("order"),
    customerEmail: customer?.email ?? cart.customer?.email ?? "",
    customerPhone: customer?.phone ?? cart.customer?.phone ?? "",
    lineItems: cart.items,
    discounts: [],
    subtotalPrice: cart.subtotalPrice,
    totalShippingPrice: cart.totalShippingPrice,
    totalTax: cart.totalTax,
    totalPrice: cart.totalPrice,
    currency: cart.currency,
    cartId: cart.id,
    payment,
    status: "created",
    financialStatus: "pending",
    fulfillmentStatus: "pending_fulfillment",
    billingAddress: payment.billingAddress,
    shippingAddress: cart.fulfillmentAddress,
    fulfillmentChoiceId: cart.fulfillmentChoiceId,
    processedAt: new Date().toISOString(),
  };

  await saveOrder(order);
  await saveCart(completedCart);

  const paymentResult = await processPayment({ orderId: order.id });
  if (paymentResult.kind === "order_not_found") {
    return { kind: "not_found" };
  }
  if (paymentResult.kind === "payment_processed") {
    order.financialStatus = "paid";
  }
  if (paymentResult.kind === "payment_failed") {
    cart.messages.push({
      kind: "payment_declined",
      reason: paymentResult.failure_reason,
    });
    order.financialStatus = "pending";
  }
  await saveOrder(order);
  await saveCart(cart);

  return { kind: "completed", cart: completedCart, order: order };
};
