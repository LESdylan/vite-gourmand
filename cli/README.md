# Vite Gourmand CLI

Fly.io-style developer tools for the Vite Gourmand backend.

## Installation

```bash
cd cli
npm install
npm run build
npm link
```

## Commands

### `vg logs`

Stream live logs from the backend.

```bash
# Stream all logs
vg logs

# Filter by level
vg logs --level warn    # warn, error only
vg logs --level error   # errors only

# Filter by source
vg logs --source api    # API requests only
vg logs --source db     # Database logs only
vg logs --source auth   # Authentication logs

# Custom backend URL
vg logs --url http://localhost:3000
vg logs --url https://api.vite-gourmand.fly.dev
```

## Example Output

```
Waiting for logs...
✓ Connected to http://localhost:3000

18:13:38 [api][info] GET /api/users 200 12ms
18:13:39 [db][warn] Connection pool exhausted
18:14:01 [api][info] POST /api/orders 201 45ms
18:14:15 [auth][error] JWT token expired
```

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build
```
