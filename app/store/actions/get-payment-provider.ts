import { PaymentProvider } from "../objects/payment";

export const getPaymentProvider = async (): Promise<PaymentProvider> => {
  return {
    provider: "arc_pay",
    supportedMethods: ["wallet"],
  };
};
