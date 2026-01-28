import { notFound } from "next/navigation";
import { loadCart } from "@/app/store/db/cart";

interface CheckoutPageProps {
  params: Promise<{ cartId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { cartId } = await params;

  const cart = await loadCart(cartId);

  if (!cart) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/70 font-sans dark:bg-black">
      <main className="min-h-screen w-full max-w-4xl px-3 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Super Café</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
              <div className="min-w-0 flex-1 md:pr-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1 break-words">
                  Cart{" "}
                  <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-slate-100">
                    {cart.id}
                  </span>
                </h2>
                {cart.customer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cart.customer.firstName} {cart.customer.lastName} •{" "}
                    {cart.customer.email}
                  </p>
                )}
              </div>
              <div className="text-left md:text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {cart.currency} {cart.totalPrice.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {cart.items.length} item
                  {cart.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-6">
            {/* Status Badge */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  cart.sourceProtocol === "ucp"
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                    : "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
                }`}
              >
                {cart.sourceProtocol.toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  cart.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : cart.status === "cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : cart.status === "checkout"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                Status:{" "}
                {cart.status.charAt(0).toUpperCase() + cart.status.slice(1)}
              </span>
              {cart.completedAt && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Completed: {new Date(cart.completedAt).toLocaleDateString()}
                </span>
              )}
              {cart.cancelledAt && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  Cancelled: {new Date(cart.cancelledAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Messages */}
            {cart.messages.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  Messages ({cart.messages.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {cart.messages.map((message, index) => (
                    <div
                      key={index}
                      className="text-xs text-amber-800 dark:text-amber-300"
                    >
                      {message.kind === "out_of_stock" && (
                        <span>Out of stock: Product {message.productId}</span>
                      )}
                      {message.kind === "quantity_not_available" && (
                        <span>
                          Quantity not available: Max {message.maxQuantity} for
                          Product {message.productId}
                        </span>
                      )}
                      {message.kind === "missing_fulfillment_address" && (
                        <span>Missing fulfillment address</span>
                      )}
                      {message.kind === "payment_declined" && (
                        <span>
                          Payment declined
                          {message.reason ? `: ${message.reason}` : ""}
                        </span>
                      )}
                      {message.kind === "missing_buyer" && (
                        <span>Buyer information is required</span>
                      )}
                      {message.kind === "missing_buyer_email" && (
                        <span>Buyer email is required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Items Section */}
            {cart.items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                  Items ({cart.items.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {cart.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {item.variantId}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 capitalize">
                              {item.fulfillmentType}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {cart.currency} {item.totalPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Original:
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cart.currency} {item.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        {item.totalDiscount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Discount:
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              -{cart.currency} {item.totalDiscount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">
                            Subtotal:
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cart.currency} {item.subtotalPrice.toFixed(2)}
                          </span>
                        </div>
                        {item.totalTax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Tax:
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {cart.currency} {item.totalTax.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                Cart Summary
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Subtotal:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {cart.currency} {cart.subtotalPrice.toFixed(2)}
                  </span>
                </div>
                {cart.totalDiscount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Discount:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{cart.currency} {cart.totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                {cart.totalShippingPrice > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Shipping:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {cart.currency} {cart.totalShippingPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                {cart.totalTax > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Tax:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {cart.currency} {cart.totalTax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-3 mt-2 border-t-2 border-slate-300 dark:border-slate-600">
                  <span className="text-slate-900 dark:text-slate-100">
                    Total:
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {cart.currency} {cart.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


