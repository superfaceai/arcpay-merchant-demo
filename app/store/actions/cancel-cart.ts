import { Cart } from "@/app/store/objects/cart";
import { loadCart, saveCart } from "../db/cart";

export const cancelCart = async ({
  cartId,
}: {
  cartId: string;
}): Promise<
  | { kind: "not_found" }
  | { kind: "completed_cannot_cancel" }
  | { kind: "already_cancelled" }
  | { kind: "cancelled"; cart: Cart }
> => {
  const cart = await loadCart(cartId);

  if (!cart) {
    return { kind: "not_found" };
  }

  if (cart.status === "cancelled") {
    return { kind: "already_cancelled" };
  }
  if (cart.status === "completed") {
    return { kind: "completed_cannot_cancel" };
  }

  const cancelledCart: Cart = {
    ...cart,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  };

  await saveCart(cancelledCart);
  return { kind: "cancelled", cart: cancelledCart };
};
