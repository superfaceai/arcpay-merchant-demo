import { Address } from "@/app/store/objects/address";

export const getTax = async (
  address?: Address
): Promise<{ taxRate: number }> => {
  if (!address) {
    return { taxRate: 0.3 };
  }

  if (address.country === "US") {
    return { taxRate: 0.05 };
  }
  if (address.country === "CZ") {
    return { taxRate: 0.21 };
  }

  return { taxRate: 0 };
};
