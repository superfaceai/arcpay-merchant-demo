import { Order } from "@/app/store/objects/order";

import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const orderFilePath = (orderId: string) =>
  path.join(process.cwd(), "temp", "orders", `${orderId}.json`);

const ensureDirectory = async (filePath: string) => {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
};

export const loadOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const fileContent = await readFile(orderFilePath(orderId), "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
};

export const saveOrder = async (order: Order): Promise<void> => {
  const filePath = orderFilePath(order.id);
  await ensureDirectory(filePath);
  await writeFile(filePath, JSON.stringify(order, null, 2));
};
