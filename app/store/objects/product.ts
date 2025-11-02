import { FulfillmentOption } from "./fulfillment-option";
import { Currency } from "./currency";

export type ProductCategory = string;

export type DimensionUnit = "cm" | "m" | "in" | "ft";
export type WeightUnit = "g" | "kg" | "lb" | "oz";
export type Weight = { amount: number; unit: WeightUnit };

export type Media = {
  type: "image" | "video" | "model_3d";
  previewImage: Image;
  presentation: "image" | "model_viewer";
};

export type Image = {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

// A variant is a specific combination of options (e.g., “T-Shirt / Size M / Color Blue”)
export type ProductVariant = {
  id: string;
  title: string; // often derived (e.g., “M / Blue”).
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency: Currency;
  weight: Weight;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit;
  };
  currentlyNotInStock: boolean; // Whether a product is out of stock but still available for purchase (used for backorders).
  availableForSale: boolean; // if purchasable
  selectedOptions: {
    name: string;
    value: string;
  }[]; // each selected option (option name + value).
  image: Image;
  fulfillmentType?: FulfillmentOption["type"];
  quantityAvailable: number;
  taxable: boolean;
};

// An option defines a dimension along which variants differ (e.g., “Size”, “Color”).
export type ProductOption = {
  id: string;
  name: string; // e.g., “Size” or “Color”.
  values: string[]; // e.g., ["S","M","L"].
  position: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  condition: "new" | "used" | "refurbished";
  brand: string;
  tags: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  defaultVariantId: ProductVariant["id"];
  currency: Currency;
  priceRange: {
    minVariantPrice: number;
    maxVariantPrice: number;
  };
  compareAtPriceRange: {
    minVariantPrice: number;
    maxVariantPrice: number;
  };
  featuredImage: Image;
  media: Media[];
  fulfillmentType: FulfillmentOption["type"];
  totalInventory: number;
};
