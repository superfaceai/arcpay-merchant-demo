import { headers } from "next/headers";

import { listCartsAction } from "@/app/store/actions/list-carts";
import { listOrdersAction } from "@/app/store/actions/list-orders";
import { CartsOrdersTabs } from "@/app/components/carts-orders-tabs";

export default async function Home() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const carts = await listCartsAction();
  const orders = await listOrdersAction();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/70 font-sans dark:bg-black">
      <main className="min-h-screen w-full max-w-4xl px-3 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Super Café</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
              Demo Store for Arc Pay
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              This is a playground e-commerce store that lets you try out
              agentic commerce protocols&nbsp;&&nbsp;payments via Arc Pay in a
              sandbox environment.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <a
                href="https://arcpay.ai"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4 hover:no-underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Try Arc Pay
              </a>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
              Use
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    1) Tell your agent to find products in the feed
                  </p>
                  <code className="block font-mono text-sm bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                    {baseUrl}/api/products
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    2) Tell your agent to use the ACP (Checkout Sessions) server
                  </p>
                  <code className="block font-mono text-sm bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                    {baseUrl}/api/acp
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    3) Connect Arc Pay to your agent
                  </p>
                  <code className="block font-mono text-sm bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                    <a
                      href="https://arcpay.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:no-underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      https://arcpay.ai
                    </a>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CartsOrdersTabs carts={carts} orders={orders} />
      </main>
    </div>
  );
}
