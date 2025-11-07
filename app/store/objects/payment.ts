import { Address } from "./address";

export type PaymentMethod = "card" | "wallet";
export type PaymentProviderName = "stripe" | "arcpay";

type ProviderWithPaymentMethods<
  N extends PaymentProviderName,
  M extends PaymentMethod[]
> = {
  provider: N;
  supportedMethods: M;
};

export type PaymentProvider =
  | ProviderWithPaymentMethods<"stripe", ["card"]>
  | ProviderWithPaymentMethods<"arcpay", ["wallet"]>;

type PaymentDelegated = {
  type: "delegated_payment";
  provider: PaymentProviderName;
  token: string;
  billingAddress?: Address;
};

export type Payment = PaymentDelegated;
