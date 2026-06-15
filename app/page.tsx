import { listCartsAction } from "@/app/store/actions/list-carts";
import { listOrdersAction } from "@/app/store/actions/list-orders";
import { listProducts } from "@/app/store/actions/list-products";
import { CartsOrdersTabs } from "@/app/components/carts-orders-tabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const carts = await listCartsAction();
  const orders = await listOrdersAction();
  const products = await listProducts();

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

            <div className="mt-3 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-slate-700 dark:text-slate-300 text-sm">
              <div className="sm:border-r sm:border-slate-200 sm:dark:border-slate-700 sm:pr-4">
                <p className="font-semibold mb-1">Supported protocols</p>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="https://ucp.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      UCP
                    </a>
                    <span className="text-slate-500 dark:text-slate-400">
                      {" "}
                      · Universal Commerce Protocol{" "}
                    </span>
                    <a
                      href="/.well-known/ucp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 dark:text-slate-300 underline underline-offset-2"
                    >
                      (profile)
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.agenticcommerce.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      ACP
                    </a>
                    <span className="text-slate-500 dark:text-slate-400">
                      {" "}
                      · Agentic Commerce Protocol
                    </span>
                  </li>
                </ul>
              </div>
              <div className="sm:pl-4">
                <p className="font-semibold mb-1">Supported payment methods</p>
                <ul className="space-y-1">
                  <li>
                    <span className="font-semibold">Arc Pay Wallet</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {" "}
                      · Use your unified wallet balance
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-slate-700 dark:text-slate-300 flex flex-col items-start sm:gap-2">
              <a
                href="https://arcpay.ai"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-900 border border-indigo-600"
              >
                Try shopping via Arc Pay
              </a>
              {/* <span className="text-slate-700 dark:text-slate-300 text-sm sm:mt-0 mt-2">
                Arc Pay lets your AI assistants make approved purchases on their own
              </span> */}
            </div>
          </div>
        </div>

        <CartsOrdersTabs carts={carts} orders={orders} products={products} />
      </main>
    </div>
  );
}
