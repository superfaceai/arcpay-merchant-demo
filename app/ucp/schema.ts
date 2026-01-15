import { z } from "zod";

// UCP Business Profile Schema
export const UCPVersion = z.literal("2026-01-11");

export const SigningKey = z.object({
  key_id: z.string(),
  public_key: z.string(),
});
export type SigningKey = z.infer<typeof SigningKey>;

export const PaymentHandler = z.object({
  id: z.string(),
  spec: z.string().url(),
  schema: z.string().url(),
});
export type PaymentHandler = z.infer<typeof PaymentHandler>;

export const RESTTransport = z.object({
  schema: z.string().url(),
  base_url: z.string().url(),
});
export type RESTTransport = z.infer<typeof RESTTransport>;

export const Service = z.object({
  version: z.string(),
  spec: z.string().url(),
  rest: RESTTransport.optional(),
});
export type Service = z.infer<typeof Service>;

// Capability (for discovery)
export const Capability = z.object({
  id: z.string(),
  spec: z.string().url(),
  schema: z.string().url(),
  version: z.string().optional(),
});
export type Capability = z.infer<typeof Capability>;

// Capability Response (for checkout/order responses)
// Based on https://ucp.dev/specification/reference/#capability-response
export const CapabilityResponse = z.object({
  name: z.string(), // Stable capability identifier in reverse-domain notation
  version: z.string(), // Capability version in YYYY-MM-DD format
  spec: z.string().url().optional(), // URL to human-readable specification document
  schema: z.string().url().optional(), // URL to JSON Schema for this capability's payload
  extends: z.string().optional(), // Parent capability this extends
  config: z.record(z.string(), z.unknown()).optional(), // Capability-specific configuration
});
export type CapabilityResponse = z.infer<typeof CapabilityResponse>;

export const BusinessProfile = z.object({
  ucp: z.object({
    version: UCPVersion,
    services: z.record(z.string(), Service),
    capabilities: z.array(Capability),
  }),
  payment: z.object({
    handlers: z.array(PaymentHandler),
    signing_keys: z.array(SigningKey),
  }),
});
export type BusinessProfile = z.infer<typeof BusinessProfile>;

// UCP Checkout Schema
// Based on UCP Checkout Capability specification
// https://ucp.dev/specification/reference/#checkout-response
export const CheckoutStatus = z.enum([
  "incomplete",
  "requires_escalation",
  "ready_for_complete",
  "complete_in_progress",
  "completed",
  "canceled",
]);

export const Currency = z.string(); // ISO 4217

export const Address = z.object({
  name: z.string().max(256).optional(),
  line_one: z.string().max(60),
  line_two: z.string().max(60).optional(),
  city: z.string().max(60),
  state: z.string().max(60),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  postal_code: z.string().max(20),
  phone_number: z.string().optional(),
});
export type Address = z.infer<typeof Address>;

export const Buyer = z.object({
  first_name: z.string().max(256).optional(),
  last_name: z.string().max(256).optional(),
  email: z.string().email().max(256).optional(),
  phone_number: z.string().optional(),
});
export type Buyer = z.infer<typeof Buyer>;

// Item (for create/update requests only)
export const Item = z.object({
  id: z.string(),
});
export type Item = z.infer<typeof Item>;

// Line Item Create Request (for checkout create)
export const LineItemCreateRequest = z.object({
  item: Item,
  quantity: z.number().positive(),
});
export type LineItemCreateRequest = z.infer<typeof LineItemCreateRequest>;

// Line Item Update Request (for checkout update)
export const LineItemUpdateRequest = z.object({
  item: Item,
  quantity: z.number().positive(),
});
export type LineItemUpdateRequest = z.infer<typeof LineItemUpdateRequest>;

export const Total = z.object({
  type: z.enum([
    "items_discount",
    "subtotal",
    "discount",
    "fulfillment",
    "tax",
    "fee",
    "total",
  ]),
  display_text: z.string().optional(),
  amount: z.number().min(0), // Amount value (can be decimal or integer)
});
export type Total = z.infer<typeof Total>;

export const FulfillmentOptionShipping = z.object({
  type: z.literal("shipping"),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  carrier_info: z.string().optional(),
  earliest_delivery_time: z.string(), // RFC 3339
  latest_delivery_time: z.string(), // RFC 3339
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
});
export type FulfillmentOptionShipping = z.infer<
  typeof FulfillmentOptionShipping
>;

export const FulfillmentOptionDigital = z.object({
  type: z.literal("digital"),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
});
export type FulfillmentOptionDigital = z.infer<typeof FulfillmentOptionDigital>;

export const FulfillmentOption = z.discriminatedUnion("type", [
  FulfillmentOptionShipping,
  FulfillmentOptionDigital,
]);
export type FulfillmentOption = z.infer<typeof FulfillmentOption>;

export const PaymentProvider = z.object({
  provider: z.string(),
  supported_payment_methods: z.array(z.string()),
});
export type PaymentProvider = z.infer<typeof PaymentProvider>;

// Link schema (for legal compliance links)
// Based on https://ucp.dev/specification/reference/#link
export const Link = z.object({
  type: z.string(), // Well-known types: privacy_policy, terms_of_service, refund_policy, shipping_policy, faq
  url: z.url(),
  title: z.string().optional(),
});
export type Link = z.infer<typeof Link>;

// Item Response (for Line Item Response)
// Based on https://ucp.dev/specification/reference/#item-response
export const ItemResponse = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().int().min(0), // Integer in minor currency units (e.g., cents)
  image_url: z.string().url().optional(),
});
export type ItemResponse = z.infer<typeof ItemResponse>;

// Line Item Response
// Based on https://ucp.dev/specification/reference/#line-item-response
export const LineItem = z.object({
  id: z.string(),
  item: ItemResponse,
  quantity: z.number().int().positive(),
  totals: z.array(Total).min(1),
  parent_id: z.string().optional(),
});
export type LineItem = z.infer<typeof LineItem>;

// Message schemas based on https://ucp.dev/specification/reference/#message
export const MessageError = z.object({
  type: z.literal("error"),
  code: z.string(), // Required for errors
  path: z.string().optional(), // JSONPath (RFC 9535)
  content_type: z.enum(["plain", "markdown"]).default("plain"),
  content: z.string(),
  severity: z.enum([
    "recoverable",
    "requires_buyer_input",
    "requires_buyer_review",
  ]),
});
export type MessageError = z.infer<typeof MessageError>;

export const MessageWarning = z.object({
  type: z.literal("warning"),
  code: z.string(), // Required for warnings
  path: z.string().optional(), // JSONPath (RFC 9535)
  content_type: z.enum(["plain", "markdown"]).default("plain"),
  content: z.string(),
});
export type MessageWarning = z.infer<typeof MessageWarning>;

export const MessageInfo = z.object({
  type: z.literal("info"),
  code: z.string().optional(), // Optional for info
  path: z.string().optional(), // JSONPath (RFC 9535)
  content_type: z.enum(["plain", "markdown"]).default("plain"),
  content: z.string(),
});
export type MessageInfo = z.infer<typeof MessageInfo>;

export const Message = z.discriminatedUnion("type", [
  MessageError,
  MessageWarning,
  MessageInfo,
]);
export type Message = z.infer<typeof Message>;

// Payment Data
// Based on https://ucp.dev/specification/reference/#payment-data
// Note: PaymentInstrument is defined later

// Token Credential Response
// Based on https://ucp.dev/specification/reference/#token-credential-response
export const TokenCredentialResponse = z.object({
  type: z.string(), // The specific type of token produced by the handler (e.g., 'stripe_token')
});
export type TokenCredentialResponse = z.infer<typeof TokenCredentialResponse>;

export const ArcPayMandateCredential = z.object({
  type: z.literal("arcpay_mandate"),
  token: z.string(),
});
export type ArcPayMandateCredential = z.infer<typeof ArcPayMandateCredential>;

// Card Credential
// Based on https://ucp.dev/specification/reference/#card-credential
export const CardCredential = z.object({
  type: z.literal("card"), // Constant = card. The credential type identifier for card credentials
  card_number_type: z.enum(["fpan", "network_token", "dpan"]), // The type of card number. Network tokens are preferred with fallback to FPAN
  number: z.string().optional(), // Card number
  expiry_month: z.number().int().min(1).max(12).optional(), // The month of the card's expiration date (1-12)
  expiry_year: z.number().int().optional(), // The year of the card's expiration date
  name: z.string().optional(), // Cardholder name
  cvc: z.string().optional(), // Card CVC number
  cryptogram: z.string().optional(), // Cryptogram provided with network tokens
  eci_value: z.string().optional(), // Electronic Commerce Indicator / Security Level Indicator provided with network tokens
});
export type CardCredential = z.infer<typeof CardCredential>;

// Payment Credential
// Based on https://ucp.dev/specification/reference/#payment-credential
// This object MUST be one of the following types: Token Credential Response, Card Credential, ArcPay Mandate Credential
// Note: More specific types (with literal `type` values) must come first in the union
// because TokenCredentialResponse has type: z.string() which would match everything
export const PaymentCredential = z.union([
  ArcPayMandateCredential, // type: "arcpay_mandate" (literal)
  CardCredential,          // type: "card" (literal)
  TokenCredentialResponse, // type: z.string() (catch-all, must be last)
]);
export type PaymentCredential = z.infer<typeof PaymentCredential>;

// Payment Handler Response (for Payment Response)
// Based on https://ucp.dev/specification/reference/#payment-handler-response
export const PaymentHandlerResponse = z.object({
  id: z.string(), // Unique identifier for this handler instance
  name: z.string(), // Specification name using reverse-DNS format (e.g., dev.ucp.delegate_payment)
  version: z.string(), // Handler version in YYYY-MM-DD format
  spec: z.string().url(), // URI pointing to the technical specification or schema
  config_schema: z.string().url(), // URI pointing to JSON Schema for config validation
  instrument_schemas: z.array(z.string().url()), // Array of URIs to instrument schemas
  config: z.record(z.string(), z.unknown()), // Dictionary with provider-specific configuration
});
export type PaymentHandlerResponse = z.infer<typeof PaymentHandlerResponse>;

// Payment Response (for checkout response)
// Based on https://ucp.dev/specification/reference/#payment-response
// Note: PaymentInstrument is defined later after CardPaymentInstrument is defined

// Order Confirmation (for checkout response)
// Based on https://ucp.dev/specification/reference/#order-confirmation
export const OrderConfirmation = z.object({
  id: z.string(),
  permalink_url: z.string().url(),
});
export type OrderConfirmation = z.infer<typeof OrderConfirmation>;

// Fulfillment Extension Schema (dev.ucp.shopping.fulfillment)
// Based on https://ucp.dev/specification/fulfillment/

// Postal Address (for Fulfillment Extension)
// Based on https://ucp.dev/specification/reference/#postal-address
export const PostalAddress = z.object({
  extended_address: z.string().optional(), // An address extension such as an apartment number, C/O or alternative name
  street_address: z.string().optional(), // The street address
  address_locality: z.string().optional(), // The locality in which the street address is, and which is in the region (e.g., Mountain View)
  address_region: z.string().optional(), // The region in which the locality is, and which is in the country (e.g., California)
  address_country: z.string().optional(), // The country (recommended: 2-letter ISO 3166-1 alpha-2 format, e.g., "US")
  postal_code: z.string().optional(), // The postal code (e.g., 94043)
  first_name: z.string().optional(), // Optional. First name of the contact associated with the address
  last_name: z.string().optional(), // Optional. Last name of the contact associated with the address
  full_name: z.string().optional(), // Optional. Full name of the contact associated with the address (if first_name or last_name fields are present they take precedence)
  phone_number: z.string().optional(), // Optional. Phone number of the contact associated with the address
});
export type PostalAddress = z.infer<typeof PostalAddress>;

// Payment Instrument Base
// Based on https://ucp.dev/specification/reference/#payment-instrument-base
export const PaymentInstrumentBase = z.object({
  id: z.string(), // A unique identifier for this instrument instance, assigned by the Agent. Used to reference this specific instrument in the 'payment.selected_instrument_id' field
  handler_id: z.string(), // The unique identifier for the handler instance that produced this instrument. This corresponds to the 'id' field in the Payment Handler definition
  type: z.string(), // The broad category of the instrument (e.g., 'card', 'tokenized_card'). Specific schemas will constrain this to a constant value
  billing_address: PostalAddress.optional(), // The billing address associated with this payment method
  credential: PaymentCredential.optional(), // Payment credential
});
export type PaymentInstrumentBase = z.infer<typeof PaymentInstrumentBase>;

// Card Payment Instrument
// Based on https://ucp.dev/specification/reference/#card-payment-instrument
export const CardPaymentInstrument = PaymentInstrumentBase.extend({
  type: z.literal("card"), // Constant = card. Indicates this is a card payment instrument
  brand: z.string(), // The card brand/network (e.g., visa, mastercard, amex)
  last_digits: z.string(), // Last 4 digits of the card number
  expiry_month: z.number().int().min(1).max(12).optional(), // The month of the card's expiration date (1-12)
  expiry_year: z.number().int().optional(), // The year of the card's expiration date
  rich_text_description: z.string().optional(), // An optional rich text description of the card to display to the user (e.g., 'Visa ending in 1234, expires 12/2025')
  rich_card_art: z.string().url().optional(), // An optional URI to a rich image representing the card (e.g., card art provided by the issuer)
});
export type CardPaymentInstrument = z.infer<typeof CardPaymentInstrument>;

export const ArcPayWalletPaymentInstrument = PaymentInstrumentBase.extend({
  type: z.literal("wallet"),
  credential: ArcPayMandateCredential.optional(),
  rich_text_description: z.string().optional(),
});
export type ArcPayWalletPaymentInstrument = z.infer<
  typeof ArcPayWalletPaymentInstrument
>;

// Payment Instrument (for Payment Response)
// Based on https://ucp.dev/specification/reference/#payment-instrument
// This object MUST be one of the following types: Card Payment Instrument
export const PaymentInstrument = z.union([
  CardPaymentInstrument,
  ArcPayWalletPaymentInstrument,
]);
export type PaymentInstrument = z.infer<typeof PaymentInstrument>;

// Payment Response (for checkout response)
// Based on https://ucp.dev/specification/reference/#payment-response
export const PaymentResponse = z.object({
  handlers: z.array(PaymentHandlerResponse),
  instruments: z.array(PaymentInstrument).optional(),
  selected_instrument_id: z.string().optional(),
});
export type PaymentResponse = z.infer<typeof PaymentResponse>;

// Payment Create Request (for checkout create)
// Based on https://ucp.dev/specification/reference/#payment-create-request
export const PaymentCreateRequest = z.object({
  selected_instrument_id: z.string().optional(),
  instruments: z.array(PaymentInstrumentBase).optional(),
});
export type PaymentCreateRequest = z.infer<typeof PaymentCreateRequest>;

// Payment Update Request (for checkout update)
// Based on https://ucp.dev/specification/reference/#payment-update-request
export const PaymentUpdateRequest = z.object({
  selected_instrument_id: z.string().optional(),
  instruments: z.array(PaymentInstrumentBase).optional(),
});
export type PaymentUpdateRequest = z.infer<typeof PaymentUpdateRequest>;

export const ShippingDestinationResponse = PostalAddress.extend({
  id: z.string(),
});
export type ShippingDestinationResponse = z.infer<
  typeof ShippingDestinationResponse
>;

export const RetailLocationResponse = z.object({
  id: z.string(),
  name: z.string(),
  address: PostalAddress.optional(),
});
export type RetailLocationResponse = z.infer<typeof RetailLocationResponse>;

// FulfillmentDestination is a union of ShippingDestination or RetailLocation
// According to spec, it's one of these types but not discriminated
// We'll use a union type for now
export const FulfillmentDestinationResponse = z.union([
  ShippingDestinationResponse,
  RetailLocationResponse,
]);
export type FulfillmentDestinationResponse = z.infer<
  typeof FulfillmentDestinationResponse
>;

export const FulfillmentOptionResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  totals: z.array(Total),
});
export type FulfillmentOptionResponse = z.infer<
  typeof FulfillmentOptionResponse
>;

export const FulfillmentGroup = z.object({
  id: z.string(),
  line_item_ids: z.array(z.string()),
  selected_option_id: z.string().optional(),
  options: z.array(FulfillmentOptionResponse),
});
export type FulfillmentGroup = z.infer<typeof FulfillmentGroup>;

export const FulfillmentMethod = z.object({
  id: z.string(),
  type: z.enum(["shipping", "pickup"]),
  line_item_ids: z.array(z.string()),
  destinations: z.array(FulfillmentDestinationResponse).optional(),
  selected_destination_id: z.union([z.string(), z.null()]).optional(),
  groups: z.array(FulfillmentGroup).optional(),
});
export type FulfillmentMethod = z.infer<typeof FulfillmentMethod>;

export const FulfillmentAvailableMethod = z.object({
  type: z.enum(["shipping", "pickup"]),
  line_item_ids: z.array(z.string()),
  fulfillable_on: z.union([z.literal("now"), z.string()]), // RFC 3339 or "now"
  description: z.string().optional(),
});
export type FulfillmentAvailableMethod = z.infer<
  typeof FulfillmentAvailableMethod
>;

export const FulfillmentResponse = z.object({
  methods: z.array(FulfillmentMethod).optional(),
  available_methods: z.array(FulfillmentAvailableMethod).optional(),
});
export type FulfillmentResponse = z.infer<typeof FulfillmentResponse>;

// Shipping Destination Request

export const RetailLocationRequest = z.object({
  name: z.string(),
  address: PostalAddress.optional(),
});
export type RetailLocationRequest = z.infer<typeof RetailLocationRequest>;

export const ShippingDestinationRequest = PostalAddress.extend({
  id: z.string().optional(),
});
export type ShippingDestinationRequest = z.infer<
  typeof ShippingDestinationRequest
>;

// Fulfillment Request Schemas (for Create/Update Checkout)
// Based on https://ucp.dev/specification/fulfillment/

// Fulfillment Destination Request
// This object MUST be one of the following types: Shipping Destination Request, Retail Location Request
// For now, we'll use PostalAddress for shipping destinations (without id, as it's a request)
export const FulfillmentDestinationRequest = z.union([
  ShippingDestinationRequest,
  RetailLocationRequest,
]);
export type FulfillmentDestinationRequest = z.infer<
  typeof FulfillmentDestinationRequest
>;

// Fulfillment Group Create Request
export const FulfillmentGroupCreateRequest = z.object({
  selected_option_id: z.string().optional(),
});
export type FulfillmentGroupCreateRequest = z.infer<
  typeof FulfillmentGroupCreateRequest
>;

// Fulfillment Group Update Request
// Based on https://ucp.dev/specification/fulfillment/#fulfillment-group-update-request
export const FulfillmentGroupUpdateRequest = z.object({
  id: z.string(), // Group identifier for referencing merchant-generated groups in updates
  selected_option_id: z.union([z.string(), z.null()]).optional(), // ID of the selected fulfillment option for this group
});
export type FulfillmentGroupUpdateRequest = z.infer<
  typeof FulfillmentGroupUpdateRequest
>;

// Fulfillment Method Create Request
// Based on https://ucp.dev/specification/fulfillment/#fulfillment-method-create-request
export const FulfillmentMethodCreateRequest = z.object({
  type: z.enum(["shipping", "pickup"]), // Fulfillment method type
  line_item_ids: z.array(z.string()).optional(), // Line item IDs fulfilled via this method
  destinations: z.array(FulfillmentDestinationRequest).optional(), // Available destinations. For shipping: addresses. For pickup: retail locations
  selected_destination_id: z.union([z.string(), z.null()]).optional(), // ID of the selected destination
  groups: z.array(FulfillmentGroupCreateRequest).optional(), // Fulfillment groups for selecting options. Agent sets selected_option_id on groups to choose shipping method
});
export type FulfillmentMethodCreateRequest = z.infer<
  typeof FulfillmentMethodCreateRequest
>;

// Fulfillment Method Update Request
// Based on https://ucp.dev/specification/fulfillment/#fulfillment-method-update-request
export const FulfillmentMethodUpdateRequest = z.object({
  id: z.string(), // Unique fulfillment method identifier
  line_item_ids: z.array(z.string()), // Line item IDs fulfilled via this method
  destinations: z.array(FulfillmentDestinationRequest).optional(), // Available destinations. For shipping: addresses. For pickup: retail locations
  selected_destination_id: z.union([z.string(), z.null()]).optional(), // ID of the selected destination
  groups: z.array(FulfillmentGroupUpdateRequest).optional(), // Fulfillment groups for selecting options. Agent sets selected_option_id on groups to choose shipping method
});
export type FulfillmentMethodUpdateRequest = z.infer<
  typeof FulfillmentMethodUpdateRequest
>;

// Fulfillment Request
// Based on https://ucp.dev/specification/fulfillment/#fulfillment-request
export const FulfillmentRequest = z.object({
  methods: z
    .array(
      z.union([FulfillmentMethodCreateRequest, FulfillmentMethodUpdateRequest])
    )
    .optional(), // Fulfillment methods for cart items
});
export type FulfillmentRequest = z.infer<typeof FulfillmentRequest>;

// Checkout Response
// Based on https://ucp.dev/specification/reference/#checkout-response
export const CheckoutSession = z.object({
  id: z.string(),
  line_items: z.array(LineItem),
  buyer: Buyer.optional(),
  status: CheckoutStatus,
  currency: Currency,
  totals: z.array(Total),
  messages: z.array(Message).optional(),
  links: z.array(Link), // Required for legal compliance
  expires_at: z.string().optional(), // RFC 3339 timestamp
  continue_url: z.string().url().optional(), // Required when status is requires_escalation
  payment: PaymentResponse, // Required
  order: OrderConfirmation.optional(), // Optional order confirmation
  fulfillment: FulfillmentResponse.optional(), // Fulfillment Extension field
});
export type CheckoutSession = z.infer<typeof CheckoutSession>;

// Request/Response Schemas
// Based on https://ucp.dev/specification/reference/#checkout-create-request
export const CreateCheckoutRequest = z.object({
  line_items: z.array(LineItemCreateRequest).min(1),
  buyer: Buyer.optional(),
  currency: Currency,
  payment: PaymentCreateRequest,
});
export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequest>;

export const CreateCheckoutResponse = CheckoutSession.extend({
  ucp: z.object({
    version: UCPVersion,
    capabilities: z.array(CapabilityResponse),
  }),
});
export type CreateCheckoutResponse = z.infer<typeof CreateCheckoutResponse>;

export const UpdateCheckoutRequest = z.object({
  id: z.string(), // Unique identifier of the checkout session
  line_items: z.array(LineItemUpdateRequest).min(1),
  buyer: Buyer.optional(),
  currency: Currency,
  payment: PaymentUpdateRequest,
  fulfillment: FulfillmentRequest.optional(),
});
export type UpdateCheckoutRequest = z.infer<typeof UpdateCheckoutRequest>;

export const UpdateCheckoutResponse = CheckoutSession.extend({
  ucp: z.object({
    version: UCPVersion,
    capabilities: z.array(CapabilityResponse),
  }),
});
export type UpdateCheckoutResponse = z.infer<typeof UpdateCheckoutResponse>;

export const GetCheckoutResponse = CheckoutSession.extend({
  ucp: z.object({
    version: UCPVersion,
    capabilities: z.array(CapabilityResponse),
  }),
});
export type GetCheckoutResponse = z.infer<typeof GetCheckoutResponse>;

// Complete Checkout Request
// Based on https://ucp.dev/specification/checkout/#complete-checkout
export const CompleteCheckoutRequest = z.object({
  id: z.string(),
  payment_data: PaymentInstrument,
});
export type CompleteCheckoutRequest = z.infer<typeof CompleteCheckoutRequest>;

export const CompleteCheckoutResponse = CheckoutSession.extend({
  ucp: z.object({
    version: UCPVersion,
    capabilities: z.array(CapabilityResponse),
  }),
});
export type CompleteCheckoutResponse = z.infer<typeof CompleteCheckoutResponse>;

export const CancelCheckoutResponse = CheckoutSession.extend({
  ucp: z.object({
    version: UCPVersion,
    capabilities: z.array(CapabilityResponse),
  }),
});
export type CancelCheckoutResponse = z.infer<typeof CancelCheckoutResponse>;

// Error Response
export const ErrorResponse = z.object({
  status: z.enum(["requires_escalation", "requires_buyer_input"]),
  messages: z.array(Message),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;
