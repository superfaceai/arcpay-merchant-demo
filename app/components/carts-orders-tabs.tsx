"use client";

import { useState } from "react";
import { OrderLineItem } from "../store/objects/order";
import { CartMessage } from "../store/objects/cart";

type Cart = {
  id: string;
  status: string;
  currency: string;
  totalPrice: number;
  items: OrderLineItem[];
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: CartMessage[];
  completedAt?: string;
  cancelledAt?: string;
  subtotalPrice: number;
  totalDiscount: number;
  totalShippingPrice: number;
  totalTax: number;
};

type Order = {
  id: string;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currency: string;
  totalPrice: number;
  lineItems: OrderLineItem[];
  processedAt: string;
  subtotalPrice: number;
  totalShippingPrice: number;
  totalTax: number;
};

type CartsOrdersTabsProps = {
  carts: Cart[];
  orders: Order[];
};

export function CartsOrdersTabs({ carts, orders }: CartsOrdersTabsProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "carts">("orders");

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "orders"
              ? "text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("carts")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "carts"
              ? "text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Carts ({carts.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              No orders found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
                      <div className="min-w-0 flex-1 md:pr-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 break-words">
                          Order{" "}
                          <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-slate-100">
                            {order.id}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Processed:{" "}
                          {new Date(order.processedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {order.currency} {order.totalPrice.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {order.lineItems.length} item
                          {order.lineItems.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col gap-6">
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "fulfilled"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : order.status === "canceled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.financialStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : order.financialStatus === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : order.financialStatus === "refunded"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {order.financialStatus
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.fulfillmentStatus === "fulfilled"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                            : order.fulfillmentStatus === "unfulfilled" ||
                              order.fulfillmentStatus === "pending_fulfillment"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                        }`}
                      >
                        {order.fulfillmentStatus
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>

                    {/* Line Items Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                        Line Items ({order.lineItems.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {order.lineItems.map((item, index) => (
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
                                  {order.currency} {item.totalPrice.toFixed(2)}
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
                                  {order.currency}{" "}
                                  {item.originalPrice.toFixed(2)}
                                </span>
                              </div>
                              {item.totalDiscount > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Discount:
                                  </span>
                                  <span className="font-medium text-red-600 dark:text-red-400">
                                    -{order.currency}{" "}
                                    {item.totalDiscount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Subtotal:
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {order.currency}{" "}
                                  {item.subtotalPrice.toFixed(2)}
                                </span>
                              </div>
                              {item.totalTax > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Tax:
                                  </span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {order.currency} {item.totalTax.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                        Order Summary
                      </h4>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-400">
                            Subtotal:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {order.currency} {order.subtotalPrice.toFixed(2)}
                          </span>
                        </div>
                        {order.totalShippingPrice > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-400">
                              Shipping:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {order.currency}{" "}
                              {order.totalShippingPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {order.totalTax > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-400">
                              Tax:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {order.currency} {order.totalTax.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-base pt-3 mt-2 border-t-2 border-slate-300 dark:border-slate-600">
                          <span className="text-slate-900 dark:text-slate-100">
                            Total:
                          </span>
                          <span className="text-slate-900 dark:text-slate-100">
                            {order.currency} {order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "carts" && (
        <div>
          {carts.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              No carts found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {carts.map((cart) => (
                <div
                  key={cart.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
                      <div className="min-w-0 flex-1 md:pr-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 break-words">
                          Cart{" "}
                          <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-slate-100">
                            {cart.id}
                          </span>
                        </h3>
                        {cart.customer && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cart.customer.firstName} {cart.customer.lastName}{" "}
                            • {cart.customer.email}
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
                        {cart.status.charAt(0).toUpperCase() +
                          cart.status.slice(1)}
                      </span>
                      {cart.completedAt && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Completed:{" "}
                          {new Date(cart.completedAt).toLocaleDateString()}
                        </span>
                      )}
                      {cart.cancelledAt && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Cancelled:{" "}
                          {new Date(cart.cancelledAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Messages */}
                    {cart.messages.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">
                          Messages ({cart.messages.length})
                        </h4>
                        <div className="flex flex-col gap-2">
                          {cart.messages.map((message, index) => (
                            <div
                              key={index}
                              className="text-xs text-amber-800 dark:text-amber-300"
                            >
                              {message.kind === "out_of_stock" && (
                                <span>
                                  Out of stock: Product {message.productId}
                                </span>
                              )}
                              {message.kind === "quantity_not_available" && (
                                <span>
                                  Quantity not available: Max{" "}
                                  {message.maxQuantity} for Product{" "}
                                  {message.productId}
                                </span>
                              )}
                              {message.kind ===
                                "missing_fulfillment_address" && (
                                <span>Missing fulfillment address</span>
                              )}
                              {message.kind === "payment_declined" && (
                                <span>
                                  Payment declined
                                  {message.reason ? `: ${message.reason}` : ""}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cart Items Section */}
                    {cart.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                          Items ({cart.items.length})
                        </h4>
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
                                    {cart.currency}{" "}
                                    {item.originalPrice.toFixed(2)}
                                  </span>
                                </div>
                                {item.totalDiscount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                      Discount:
                                    </span>
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                      -{cart.currency}{" "}
                                      {item.totalDiscount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Subtotal:
                                  </span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {cart.currency}{" "}
                                    {item.subtotalPrice.toFixed(2)}
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
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                        Cart Summary
                      </h4>
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
                              {cart.currency}{" "}
                              {cart.totalShippingPrice.toFixed(2)}
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

