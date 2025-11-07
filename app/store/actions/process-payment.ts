import { ArcPayClient } from "@/app/lib/arcpay";
import { loadOrder } from "../db/order";
import { Order } from "../objects/order";

type ProcessPaymentResult =
  | { kind: "order_not_found" }
  | { kind: "payment_processed" }
  | { kind: "payment_pending" }
  | { kind: "payment_failed" }
  | { kind: "provider_not_supported" };

export const processPayment = async ({
  orderId,
}: {
  orderId: string;
}): Promise<ProcessPaymentResult> => {
  const order = await loadOrder(orderId);

  if (!order) {
    return { kind: "order_not_found" };
  }

  // Capture the payment via ArcPay
  if (order.payment.provider === "arcpay") {
    return await payWithArcPay(order);
  }

  return { kind: "provider_not_supported" };
};

export const payWithArcPay = async (
  order: Order
): Promise<ProcessPaymentResult> => {
  try {
    const arcpay = ArcPayClient.create();
    const paymentCapture = await arcpay.capturePayment(
      {
        amount: order.totalPrice.toString(),
        currency: ArcPayClient.fiatToStableCoin(order.currency),
        granted_mandate_secret: order.payment.token,
      },
      { polling: true }
    );

    if (paymentCapture.status === "succeeded") {
      return { kind: "payment_processed" };
    } else if (
      paymentCapture.status === "requires_capture" ||
      paymentCapture.status === "processing"
    ) {
      return { kind: "payment_pending" };
    } else {
      return { kind: "payment_failed" };
    }
  } catch (error) {
    console.error("Error capturing payment:", error);
    return { kind: "payment_failed" };
  }
};
