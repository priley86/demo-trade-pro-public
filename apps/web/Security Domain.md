# Security Domain

The `/web` app uses Next.js Server Actions with Auth0 to create a clear security boundary. All sensitive operations (authentication, JWT tokens, API calls to the stock backend) happen server-side using `'use server'` actions. The client components only handle UI interactions - no tokens or sensitive data is accessible to the client.

Server Actions like `getPortfolio()` and `createOrder()` check `auth0.getSession()` first, then use `auth0.getAccessToken()` to make authenticated calls to the stock API. Public data like stock prices can be fetched without auth, but everything else requires server-side authentication.

This approach makes the security domain explicit: **server handles auth and data, client handles presentation**. This is a clear pattern that we follow today in Web. APIs are business logic, and Clients (even stateful ones) are presentation logic. 
