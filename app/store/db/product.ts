import { db } from "@/app/lib/db";
import { Product } from "@/app/store/objects/product";

const PRODUCTS_KEY = "products:current";

export const loadProducts = async (): Promise<Product[] | null> => {
  try {
    const products = await db.get<Product[]>(PRODUCTS_KEY);
    return products ?? null;
  } catch (error) {
    console.error("Failed to load products:", error);
    return null;
  }
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    await db.set(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Failed to save products:", error);
    throw error;
  }
};


