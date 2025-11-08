import { db } from "@/app/lib/db";
import { Cart } from "@/app/store/objects/cart";

const storageKey = (cartId: string) => `cart:${cartId}`;

const EXPIRE_AFTER_SECONDS: Record<Cart["status"], number> = {
  shopping: 60 * 60 * 1, // 1 hour
  checkout: 60 * 60 * 1, // 1 hour
  completed: 60 * 60 * 24, // 24 hours
  cancelled: 60 * 60 * 1, // 1 hour
};

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
      .expire(storageKey(cart.id), EXPIRE_AFTER_SECONDS[cart.status])
      .exec();
  } catch (error) {
    console.error(`Failed to save cart ${cart.id}:`, error);
    throw error;
  }
};

export const listCarts = async (): Promise<Cart[]> => {
  try {
    const keys = await db.keys("cart:*");
    if (keys.length === 0) {
      return [];
    }

    const carts = await db.mget<Cart[]>(...keys);
    return carts.filter((cart): cart is Cart => cart !== null);
  } catch (error) {
    console.error("Failed to list carts:", error);
    return [];
  }
};
