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

export const listOrders = async (): Promise<Order[]> => {
  try {
    const keys = await db.keys("order:*");
    if (keys.length === 0) {
      return [];
    }

    const orders = await db.mget<Order[]>(...keys);
    return orders
      .filter((order): order is Order => order !== null)
      .sort(
        (a, b) =>
          new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
      );
  } catch (error) {
    console.error("Failed to list orders:", error);
    return [];
  }
};
