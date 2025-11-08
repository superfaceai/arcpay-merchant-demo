import { listCarts } from "@/app/store/db/cart";
import { Cart } from "@/app/store/objects/cart";

export const listCartsAction = async (): Promise<Cart[]> => {
  return await listCarts();
};

