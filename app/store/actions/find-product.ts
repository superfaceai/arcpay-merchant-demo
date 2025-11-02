import { Product } from "../objects/product";
import { listProducts } from "./list-products";

export const findProduct = async (
  productOrVariantId: string
): Promise<Product | null> => {
  const products = await listProducts();

  return (
    products.find(
      (product) =>
        product.id === productOrVariantId ||
        product.variants.some((variant) => variant.id === productOrVariantId)
    ) ?? null
  );
};
