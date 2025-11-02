import { db } from "@/app/lib/db";
import { Order } from "@/app/store/objects/order";

const storageKey = (orderId: string) => `order:${orderId}`;

export const loadOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const order = await db.get<Order>(storageKey(orderId));
    return order || null;
  } catch (error) {
    console.error(`Failed to load order ${orderId}:`, error);
    return null;
  }
};

export const saveOrder = async (order: Order): Promise<void> => {
  try {
    await db
      .multi()
      .set(storageKey(order.id), JSON.stringify(order))
      .expire(storageKey(order.id), 60 * 60 * 24) // 24 hours in seconds
      .exec();
  } catch (error) {
    console.error(`Failed to save order ${order.id}:`, error);
    throw error;
  }
};
