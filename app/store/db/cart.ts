import { db } from "@/app/lib/db";
import { Cart } from "@/app/store/objects/cart";

const storageKey = (cartId: string) => `cart:${cartId}`;

export const loadCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const cart = await db.get<Cart>(storageKey(cartId));
    return cart || null;
  } catch (error) {
    console.error(`Failed to load cart ${cartId}:`, error);
    return null;
  }
};

export const saveCart = async (cart: Cart): Promise<void> => {
  try {
    await db
      .multi()
      .set(storageKey(cart.id), JSON.stringify(cart))
      .expire(storageKey(cart.id), 60 * 60 * 24) // 24 hours in seconds
      .exec();
  } catch (error) {
    console.error(`Failed to save cart ${cart.id}:`, error);
    throw error;
  }
};
