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
  method: PaymentMethod;
  token: string;
  billingAddress?: Address;
  referenceNumber?: string;
};

export type Payment = PaymentDelegated;
