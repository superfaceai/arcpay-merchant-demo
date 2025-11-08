import { listOrders } from "@/app/store/db/order";
import { Order } from "@/app/store/objects/order";

export const listOrdersAction = async (): Promise<Order[]> => {
  return await listOrders();
};

