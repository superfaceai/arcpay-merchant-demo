import { Currency as FiatCurrency } from "@/app/store/objects/currency";

export type Currency = "USDC" | "EURC";

export interface PaymentCaptureRequest {
  amount: string;
  currency: Currency;
  granted_mandate_secret: string;
}

export interface PaymentCapture {
  id: string;
  live: boolean;
  amount: string;
  currency: string;
  method: {
    type: string;
  };
  status:
    | "requires_capture"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled";
  granted_mandate_secret?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  failure_reason?: string;
  failed_at?: string;
  finished_at?: string;
  created_at: string;
  metadata?: Record<string, string>;
}

export interface ApiResponse<T> {
  object: string;
  data: T;
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail?: string;
}

export class ArcPayClient {
  private baseUrl: string;
  private apiKey: string;

  /**
   * Create an ArcPay client instance
   *
   * @param apiKey - API key (optional, defaults to ARCPAY_API_KEY env var)
   * @param baseUrl - Base URL (optional, defaults to ARCPAY_BASE_URL env var or https://api.arcpay.ai)
   * @returns ArcPayClient instance
   */
  static create(apiKey?: string, baseUrl?: string): ArcPayClient {
    const resolvedApiKey = apiKey || process.env.ARCPAY_API_KEY;
    const resolvedBaseUrl =
      baseUrl || process.env.ARCPAY_API_URL || "https://dev.arcpay.ai";

    if (!resolvedApiKey) {
      throw new Error(
        "API key is required. Provide it as parameter or set ARCPAY_API_KEY environment variable."
      );
    }

    return new ArcPayClient(resolvedBaseUrl, resolvedApiKey);
  }

  static fiatToStableCoin(fiatCurrency: FiatCurrency): Currency {
    const mapping: Record<string, Currency> = {
      USD: "USDC",
      EUR: "EURC",
    };
    return mapping[fiatCurrency];
  }

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = apiKey;
  }

  async capturePayment(
    request: PaymentCaptureRequest,
    options: { idempotencyKey?: string; polling?: boolean } = { polling: false }
  ): Promise<PaymentCapture> {
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    const response = await fetch(`${this.baseUrl}/payment_captures`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(
        `Payment capture failed: ${error.title}${
          error.detail ? ` - ${error.detail}` : ""
        }`
      );
    }

    const result: PaymentCapture = await response.json();
    if (options.polling) {
      return this.getPaymentCapture(result.id, {
        polling: true,
        pollInterval: 2000,
        timeout: 60000,
      });
    }
    return result;
  }

  /**
   * Get a payment capture by ID
   *
   * @param captureId - Payment capture ID
   * @param options - Optional polling configuration
   * @returns Payment capture object
   */
  async getPaymentCapture(
    captureId: string,
    options: { polling: boolean; pollInterval: number; timeout: number } = {
      polling: false,
      pollInterval: 2000,
      timeout: 60000,
    }
  ): Promise<PaymentCapture> {
    const startTime = Date.now();

    while (true) {
      const response = await fetch(
        `${this.baseUrl}/payment_captures/${captureId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(
          `Failed to get payment capture: ${error.title}${
            error.detail ? ` - ${error.detail}` : ""
          }`
        );
      }

      const result: PaymentCapture = await response.json();

      // Return if status is not processing
      if (result.status !== "processing") {
        return result;
      }

      // If polling is disabled, return the current result
      if (options.polling === false) {
        return result;
      }

      // Check if timeout is reached
      if (Date.now() - startTime >= options.timeout) {
        console.warn(`Timeout reached while polling for payment capture`, {
          captureId,
        });
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, options.pollInterval));
    }
  }
}
