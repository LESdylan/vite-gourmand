# Postman Collections

This directory contains Postman collections for testing the Vite Gourmand API independently from the frontend.

## Collections

| File | Description |
|------|-------------|
| `auth.json` | Authentication endpoints (register, login, refresh, profile) |
| `orders.json` | Order lifecycle management (create, status updates, queries) |
| `admin.json` | Admin operations (user management, review moderation, stats) |

## Quick Start

### 1. Import Collections

1. Open Postman
2. Click **Import** (top left)
3. Drag and drop all `.json` files from this folder
4. Collections appear in sidebar

### 2. Set Base URL

Each collection has a `baseUrl` variable set to `http://localhost:3000/api`.
Change it if your backend runs on a different port.

### 3. Login First

Before using protected endpoints:

1. Open **Auth** collection
2. Run "Login" request with credentials:
   - Admin: `admin@vitegourmand.fr` / `Admin123!`
   - Manager: `manager@vitegourmand.fr` / `Manager123!`
   - Client: `alice.dupont@email.fr` / `Client123!`
3. Token is automatically saved to collection variables

## Test Credentials

After running `npm run seed` or `npm run seed:test`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vitegourmand.fr | Admin123! |
| Manager | manager@vitegourmand.fr | Manager123! |
| Client | alice.dupont@email.fr | Client123! |
| Test Admin | test.admin@test.com | Test123! |
| Test Manager | test.manager@test.com | Test123! |
| Test Client | test.client@test.com | Test123! |

## Order Lifecycle

The **Orders** collection simulates the complete order workflow:

```
pending → confirmed → preparing → ready → delivering → delivered → completed
                                                      ↘ cancelled
```

Use the **Order Lifecycle** folder and run requests in sequence.

## Collection Runner

To run all tests automatically:

1. Click on collection name
2. Click **Run** button
3. Select requests to include
4. Click **Run Collection**

Results show pass/fail for each test script.

## Environment Variables

Collections use these variables:

| Variable | Description |
|----------|-------------|
| `baseUrl` | API base URL |
| `accessToken` | JWT access token (auto-saved) |
| `refreshToken` | JWT refresh token (auto-saved) |
| `orderId` | Current order ID |
| `userId` | Current user ID |

## Simulated Events

These collections simulate real user actions:

### User Events
- User registration
- User login
- Profile view
- Token refresh

### Order Events
- Place order
- Accept order (employee)
- Start preparing (kitchen)
- Ready for delivery
- Out for delivery
- Delivered
- Order completed
- Cancel order

### Admin Events
- Create employee
- Update user role
- Moderate reviews
- View statistics

## Tips

1. **Run in order**: Order lifecycle tests depend on previous steps
2. **Check variables**: After login, verify `accessToken` is set
3. **Reset data**: Run `npm run seed:test` to reset test data
4. **View logs**: Check Postman console for request/response details

## Integration with Jest

These same flows are also tested programmatically in:

- `test/order-lifecycle.e2e-spec.ts`
- `test/api-flows.e2e-spec.ts`
- `test/order.service.spec.ts`

Run with:
```bash
npm run test:orders    # Order tests only
npm run test:flows     # API flow tests
npm run test:e2e       # All E2E tests
```
