import { NextRequest } from "next/server";
import { saveProducts } from "@/app/store/db/product";
import { seedProducts } from "@/app/store/actions/list-products";

export const GET = async (req: NextRequest,) => {
  await saveProducts(seedProducts);

  return Response.json(
    { status: "ok", message: "Products reset to seed state." },
    { status: 200 }
  );
};


