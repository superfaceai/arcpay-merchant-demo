import { Link } from "./schema";

export const getCheckoutSessionLinks = (baseUrl: string): Link[] => [
  {
    type: "terms_of_use",
    value: new URL("/terms-of-use", baseUrl).toString(),
  },
  {
    type: "privacy_policy",
    value: new URL("/privacy-policy", baseUrl).toString(),
  },
  {
    type: "seller_shop_policies",
    value: new URL("/seller-shop-policies", baseUrl).toString(),
  },
];
