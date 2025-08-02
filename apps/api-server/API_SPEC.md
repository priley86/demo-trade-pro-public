# Fake Stock Trading API Specification

Base URL: `http://localhost:3000/api`

## Authentication

This API uses **Auth0 JWT tokens** for authentication and authorization. Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Scopes
The API uses scope-based authorization with the following scopes:
- `trade:read` - Required to view orders
- `trade:write` - Required to create orders
- `portfolio:read` - Required to view portfolio

### Authentication Requirements
- **Public**: Health check, stock listings (read-only)
- **Protected**: Order creation, order viewing, portfolio (require specific scopes)

## Data Models

### User
```typescript
interface User {
  id: string;            // Auth0 user ID (sub claim)
  email: string;         // User email
  cashBalance: string;   // e.g., "10000.00" (decimal string)
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

### Stock
```typescript
interface Stock {
  symbol: string;        // e.g., "WAYNE", "STARK", "LEX", "OSC"
  name: string;          // e.g., "Wayne Enterprises"
  price: string;         // e.g., "96.15" (decimal string)
  updatedAt: string;     // ISO timestamp
}
```

### Order
```typescript
interface Order {
  id: string;            // UUID
  companyId: string;     // UUID (internal reference)
  userId: string;        // Auth0 user ID (sub claim)
  side: "BUY" | "SELL";
  quantity: number;      // Integer
  price: string;         // e.g., "105.00" (decimal string)
  status: "PENDING" | "FILLED" | "REJECTED";
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

### CreateOrderRequest
```typescript
interface CreateOrderRequest {
  symbol: string;        // Stock symbol, e.g., "WAYNE"
  side: "BUY" | "SELL";
  quantity: number;      // Positive integer
  price: number;         // Positive number (gets converted to string)
}
```

## API Endpoints

### 1. Health Check
**GET** `/api/ping`

**Authentication:** None required

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2025-08-02T02:11:43.987Z"
}
```

### 2. Portfolio
**GET** `/api/portfolio`

**Authentication:** Required (JWT token + `portfolio:read` scope)

**Response:**
```json
{
  "cashBalance": "9500.00",
  "holdings": [
    {
      "symbol": "WAYNE",
      "name": "Wayne Enterprises",
      "shares": 5
    },
    {
      "symbol": "STARK",
      "name": "Stark Industries",
      "shares": 10
    }
  ]
}
```

### 3. List All Stocks
**GET** `/api/stocks`

**Authentication:** None required

**Response:**
```json
[
  {
    "symbol": "WAYNE",
    "name": "Wayne Enterprises", 
    "price": "96.15",
    "updatedAt": "2025-08-02T02:11:44.831Z"
  },
  {
    "symbol": "STARK",
    "name": "Stark Industries",
    "price": "98.10", 
    "updatedAt": "2025-08-02T02:11:44.834Z"
  },
  {
    "symbol": "LEX",
    "name": "LexCorp",
    "price": "103.07",
    "updatedAt": "2025-08-02T02:11:44.837Z"
  },
  {
    "symbol": "OSC", 
    "name": "Oscorp",
    "price": "96.70",
    "updatedAt": "2025-08-02T02:11:44.840Z"
  }
]
```

### 4. Get Specific Stock
**GET** `/api/stocks/:symbol`

**Authentication:** None required

**Path Parameters:**
- `symbol`: Stock symbol (WAYNE, STARK, LEX, OSC)

**Response:**
```json
{
  "symbol": "WAYNE",
  "name": "Wayne Enterprises",
  "price": "96.15", 
  "updatedAt": "2025-08-02T02:11:44.831Z"
}
```

**Error (404):**
```json
{
  "error": "Symbol not found"
}
```

### 5. Create Order
**POST** `/api/orders`

**Authentication:** Required (JWT token + `trade:write` scope)

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "symbol": "WAYNE",
  "side": "BUY",
  "quantity": 10,
  "price": 105
}
```

**Response (201):**
```json
{
  "id": "1c9e6ece-a455-43a4-9bfc-81aa55629547",
  "companyId": "440421e2-685f-4b08-9cd9-61408cf1d421",
  "userId": "auth0|123456789",
  "side": "BUY",
  "quantity": 10,
  "price": "105.00",
  "status": "FILLED",
  "createdAt": "2025-08-02T02:11:46.629Z",
  "updatedAt": "2025-08-02T02:11:46.629Z"
}
```

**Error (400):**
```json
{
  "error": "Invalid request body",
  "details": "Validation error message"
}
```

**Error (400 - Insufficient Funds):**
```json
{
  "error": "Insufficient funds"
}
```

**Error (400 - Insufficient Shares):**
```json
{
  "error": "Insufficient shares"
}
```

**Error (404):**
```json
{
  "error": "Symbol not found" 
}
```

### 6. Get Order by ID
**GET** `/api/orders/:id`

**Authentication:** Required (JWT token + `trade:read` scope - users can only access their own orders)

**Path Parameters:**
- `id`: Order UUID

**Response:**
```json
{
  "id": "1c9e6ece-a455-43a4-9bfc-81aa55629547",
  "companyId": "440421e2-685f-4b08-9cd9-61408cf1d421",
  "userId": "auth0|123456789",
  "side": "BUY",
  "quantity": 10,
  "price": "105.00",
  "status": "FILLED",
  "createdAt": "2025-08-02T02:11:46.629Z",
  "updatedAt": "2025-08-02T02:11:46.629Z"
}
```

**Error (404):**
```json
{
  "error": "Order not found"
}
```

### 7. List User Orders
**GET** `/api/orders`

**Authentication:** Required (JWT token + `trade:read` scope - returns only the authenticated user's orders)

**Response:**
```json
[
  {
    "id": "1c9e6ece-a455-43a4-9bfc-81aa55629547",
    "symbol": "WAYNE",
    "side": "BUY",
    "quantity": 10, 
    "price": "105.00",
    "status": "FILLED",
    "createdAt": "2025-08-02T02:11:46.629Z",
    "updatedAt": "2025-08-02T02:11:46.629Z"
  }
]
```



## Available Companies

- **WAYNE** - Wayne Enterprises (Batman's company)  
- **STARK** - Stark Industries (Iron Man's company)
- **LEX** - LexCorp (Superman's nemesis)
- **OSC** - Oscorp (Spider-Man universe)

## Authentication Errors

### 401 Unauthorized
Returned when:
- No Authorization header provided
- Invalid or expired JWT token
- Token verification fails

```json
{
  "error": "Missing or invalid authorization header"
}
```

### 403 Forbidden
Returned when:
- User trying to access another user's data

```json
{
  "error": "Access denied"
}
```

## Notes for Frontend Development

1. **Authentication**: Order and portfolio endpoints require JWT tokens from Auth0
2. **User Isolation**: Users can only see their own orders and portfolio
3. **Starting Balance**: Users start with $10,000 cash automatically
4. **Order Validation**: Orders check for sufficient funds/shares before execution
5. **Live Prices**: Stock prices update automatically when fetched (±5% random variation)
6. **Auto-Fill Orders**: All orders are automatically marked as "FILLED" for demo purposes  
7. **Price Format**: Prices are returned as strings with 2 decimal places
8. **Timestamps**: All timestamps are in ISO 8601 format with timezone
9. **CORS**: API supports cross-origin requests
10. **Error Handling**: All errors return appropriate HTTP status codes with JSON error messages

## Example Usage

### Public Endpoints (No Authentication)
```javascript
// Fetch all stocks
const stocks = await fetch('/api/stocks').then(r => r.json());

// Get specific stock
const wayne = await fetch('/api/stocks/WAYNE').then(r => r.json());

// Health check
const health = await fetch('/api/ping').then(r => r.json());
```

### Protected Endpoints (Require Authentication)
```javascript
// Get user portfolio
const portfolio = await fetch('/api/portfolio', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
}).then(r => r.json());

// Place buy order
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    symbol: 'WAYNE',
    side: 'BUY', 
    quantity: 10,
    price: 105
  })
}).then(r => r.json());

// Get user's orders
const userOrders = await fetch('/api/orders', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
}).then(r => r.json());

// Get specific order (user's own only)
const orderDetails = await fetch(`/api/orders/${order.id}`, {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
}).then(r => r.json());
```


