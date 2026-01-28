export const getCheckoutDetailUrl = (baseUrl: string, cartId: string): string =>
  new URL(`/checkout/${cartId}`, baseUrl).toString();

export const getOrderDetailUrl = (baseUrl: string, orderId: string): string =>
  new URL(`/orders/${orderId}`, baseUrl).toString();


