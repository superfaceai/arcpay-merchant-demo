import { NextRequest } from "next/server";
import { listProducts } from "@/app/store/actions/list-products";
import { findProduct } from "@/app/store/actions/find-product";

export const GET = async (rawRequest: NextRequest) => {
  const findId = rawRequest.nextUrl.searchParams.get("find_id");

  if (findId) {
    const product = await findProduct(findId);
    return Response.json(
      { search: { id: findId }, data: product ? [product] : [] },
      {
        status: 200,
      }
    );
  }

  const products = await listProducts();

  return Response.json(
    { data: products },
    {
      status: 200,
    }
  );
};
