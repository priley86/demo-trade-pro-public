import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Server-side Auth0 client instance
export const auth0 = new Auth0Client({
    authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: process.env.API_DEFAULT_SCOPES
    }
});
