# Paygrounds

This is a playground e-commerce store that lets you try out agentic payments via Arc Pay in a sandbox environment.

## Agentic Commerce Protocol (ACP)

| Protocol Part               | Supports       |
| --------------------------- | -------------- |
| Checkout Sessions           | ✅ All methods |
| Delegated Payment providers | Arc Pay      |
| Delegated Payment method    | `wallet`       |

## Docs

Use the [included Postman collection](./docs/) to try out the store API:

- `GET /api/products` lists products in JSON
- `/api/acp/...` path prefix hosts the [ACP Checkout Sessions](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/openapi/openapi.agentic_checkout.yaml)
  - `POST /checkout_sessions`
  - `POST /checkout_sessions/{checkout-session-id}`
  - `GET /checkout_sessions/{checkout-session-id}`
  - `POST /checkout_sessions/{checkout-session-id}/complete`
  - `POST /checkout_sessions/{checkout-session-id}/cancel`

## Development

Install the dependencies

```bash
npm i
```

Set the environment variables
```bash
cp .env.example .env
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
