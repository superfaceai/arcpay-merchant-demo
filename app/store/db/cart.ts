import { Cart } from "@/app/store/objects/cart";

import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const cartFilePath = (cartId: string) =>
  path.join(process.cwd(), "temp", "carts", `${cartId}.json`);

const ensureDirectory = async (filePath: string) => {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
};

export const loadCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const fileContent = await readFile(cartFilePath(cartId), "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
};

export const saveCart = async (cart: Cart): Promise<void> => {
  const filePath = cartFilePath(cart.id);
  await ensureDirectory(filePath);
  await writeFile(filePath, JSON.stringify(cart, null, 2));
};
