import { PaymentProvider } from "../objects/payment";

export const getPaymentProvider = async (): Promise<PaymentProvider> => {
  return {
    provider: "agentpay",
    supportedMethods: ["wallet"],
  };
};
