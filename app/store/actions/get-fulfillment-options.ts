import { FulfillmentOption } from "@/app/store/objects/fulfillment-option";
import { Cart } from "@/app/store/objects/cart";

export const getFulfillmentOptions = async (
  cart: Pick<Cart, "fulfillmentAddress" | "items">
): Promise<FulfillmentOption[]> => {
  if (!cart.fulfillmentAddress) {
    return [];
  }

  if (cart.items.every((item) => item.fulfillmentType === "digital")) {
    return FULFILLMENT_OPTIONS.filter((option) => option.type === "digital");
  }

  return FULFILLMENT_OPTIONS.filter((option) => option.type === "shipping");
};

const FULFILLMENT_OPTIONS: FulfillmentOption[] = [
  {
    id: "ful_IoOTbrNr7NGs8TKgaZ982",
    type: "shipping",
    title: "Worldwide Shipping",
    subtitle: "Get your order delivered to your door worldwide.",
    carrier: "FedEx",
    estimatedDeliveryMinDays: 3,
    estimatedDeliveryMaxDays: 14,
    currency: "USD",
    basePrice: 6,
  },
  {
    id: "ful_ElsqLNhSVEwlCWcC5SI43",
    type: "shipping",
    title: "Express Worldwide Shipping",
    subtitle: "Get your order delivered to your door worldwide in 1-2 days.",
    carrier: "DHL Express",
    estimatedDeliveryMinDays: 1,
    estimatedDeliveryMaxDays: 2,
    currency: "USD",
    basePrice: 30,
  },
  {
    id: "ful_MEhBAHAHb6FW3Odr6oqJr",
    type: "digital",
    title: "Digital Download",
    subtitle: "Download your order instantly.",
    basePrice: 0,
  },
];
