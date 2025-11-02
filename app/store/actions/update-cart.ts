import { generateId } from "@/app/lib/generate-id";
import { Cart, CartMessage, Customer } from "@/app/store/objects/cart";
import { OrderLineItem } from "@/app/store/objects/order";
import { Address } from "@/app/store/objects/address";

import { findProduct } from "./find-product";
import { loadCart, saveCart } from "../db/cart";
import { Currency } from "../objects/currency";
import { FulfillmentOption } from "../objects/fulfillment-option";
import { getTax } from "./get-tax";
import { getFulfillmentOptions } from "./get-fulfillment-options";
import { amount } from "@/app/lib/amount";

type UpdateCartResult =
  | { kind: "not_found" }
  | { kind: "completed_cannot_update" }
  | { kind: "cancelled_cannot_update" }
  | { kind: "invalid_product_id"; productId: string; itemIndex: number }
  | { kind: "invalid_fulfillment_choice_id"; fulfillmentChoiceId: string }
  | { kind: "updated"; cart: Cart };

export const updateCart = async ({
  cartId,
  items,
  customer,
  fulfillmentAddress,
  fulfillmentChoiceId,
}: {
  cartId?: string;
  customer?: Customer;
  items?: Pick<OrderLineItem, "variantId" | "quantity">[];
  fulfillmentAddress?: Address;
  fulfillmentChoiceId?: FulfillmentOption["id"];
}): Promise<UpdateCartResult> => {
  const foundCart = cartId ? await loadCart(cartId) : undefined;

  if (cartId && !foundCart) {
    return { kind: "not_found" };
  }

  const cart = foundCart ?? initCart();

  if (cart.status === "completed") {
    return { kind: "completed_cannot_update" };
  }

  if (cart.status === "cancelled") {
    return { kind: "cancelled_cannot_update" };
  }

  const newFulfillmentAddress = fulfillmentAddress ?? cart.fulfillmentAddress;
  const { taxRate } = await getTax(newFulfillmentAddress);

  const messages: CartMessage[] = [];
  let currency: Currency = cart.currency;
  let newItems: OrderLineItem[] = cart.items;
  let subtotalPrice: number = cart.subtotalPrice;
  let totalTax: number = cart.totalTax;

  if (items) {
    const products = await Promise.all(
      items.map((item) => findProduct(item.variantId))
    );

    newItems = [];
    currency = products[0]?.currency ?? "USD";

    for (let ix = 0; ix < products.length; ix++) {
      const product = products[ix];

      if (product === null) {
        return {
          kind: "invalid_product_id",
          productId: items[ix].variantId,
          itemIndex: ix,
        };
      }

      const item = items[ix];

      const variant =
        product.variants.find((variant) => variant.id === item.variantId) ||
        product.variants.find(
          (variant) => variant.id === product.defaultVariantId
        )!;

      if (variant.quantityAvailable === 0 || !variant.availableForSale) {
        messages.push({
          kind: "out_of_stock",
          productId: variant.id,
          itemIndex: ix,
        });
      }

      if (
        variant.quantityAvailable > 0 &&
        variant.availableForSale &&
        variant.quantityAvailable < item.quantity
      ) {
        messages.push({
          kind: "quantity_not_available",
          productId: variant.id,
          itemIndex: ix,
          maxQuantity: variant.quantityAvailable,
        });
      }

      const subtotalPrice = amount(variant.price * item.quantity);
      const totalTax = variant.taxable ? amount(subtotalPrice * taxRate) : 0;
      const totalPrice = amount(subtotalPrice + totalTax);

      newItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        fulfillmentType: variant.fulfillmentType || product.fulfillmentType,
        title: variant.title,
        originalPrice: variant.price,
        totalDiscount: 0,
        subtotalPrice,
        totalTax,
        totalPrice,
      });
    }

    subtotalPrice = amount(
      newItems.reduce((acc, item) => acc + item.subtotalPrice, 0)
    );
    totalTax = amount(newItems.reduce((acc, item) => acc + item.totalTax, 0));
  }

  const validFulfillmentOptions = await getFulfillmentOptions({
    fulfillmentAddress: newFulfillmentAddress,
    items: newItems,
  });

  if (
    fulfillmentChoiceId &&
    !validFulfillmentOptions.some((option) => option.id === fulfillmentChoiceId)
  ) {
    return { kind: "invalid_fulfillment_choice_id", fulfillmentChoiceId };
  }

  const newFulfillmentChoiceId =
    fulfillmentChoiceId ?? // use explicitly chosen fulfillment option
    cart.fulfillmentChoiceId ?? // use previously chosen fulfillment option
    validFulfillmentOptions.sort((a, b) => a.basePrice - b.basePrice)?.[0]
      ?.id ?? // use cheapest fulfillment option
    undefined;

  const selectedFulfillmentOption = validFulfillmentOptions.find(
    (option) => option.id === newFulfillmentChoiceId
  );

  if (!selectedFulfillmentOption) {
    messages.push({
      kind: "missing_fulfillment_address",
    });
  }

  const shippingPrice = selectedFulfillmentOption?.basePrice ?? 0;
  const shippingTax = amount(shippingPrice * taxRate);
  totalTax = amount(totalTax + shippingTax);

  const status: Cart["status"] =
    newItems.length > 0 &&
    newFulfillmentChoiceId &&
    newFulfillmentAddress &&
    !messages.find((m) => m.kind === "out_of_stock") &&
    !messages.find((m) => m.kind === "quantity_not_available")
      ? "checkout"
      : "shopping";

  const newCart: Cart = {
    ...cart,
    customer: customer ?? cart.customer,
    items: newItems,
    currency,
    fulfillmentAddress: newFulfillmentAddress,
    fulfillmentChoiceId: newFulfillmentChoiceId,
    status,
    subtotalPrice,
    totalDiscount: 0,
    totalShippingPrice: shippingPrice,
    totalTax,
    totalPrice: amount(subtotalPrice + shippingPrice + totalTax),
    messages,
  };

  await saveCart(newCart);
  return { kind: "updated", cart: newCart };
};

const initCart = (): Cart => {
  return {
    id: generateId("cart"),
    items: [],
    status: "shopping",
    currency: "USD",
    totalDiscount: 0,
    subtotalPrice: 0,
    totalShippingPrice: 0,
    totalTax: 0,
    totalPrice: 0,
    messages: [],
  };
};
