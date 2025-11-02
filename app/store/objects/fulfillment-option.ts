import { Currency } from "./currency";

export type FulfillmentOptionShipping = {
  id: string;
  type: "shipping";
  title: string;
  subtitle: string;
  carrier: string;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  currency: Currency;
  basePrice: number;
};

export type FulfillmentOptionDigital = {
  id: string;
  type: "digital";
  title: string;
  subtitle: string;
  basePrice: 0;
};

export type FulfillmentOption =
  | FulfillmentOptionShipping
  | FulfillmentOptionDigital;
