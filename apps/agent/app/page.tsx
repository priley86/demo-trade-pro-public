import { auth0 } from "../lib/auth0";
import ChatClient from "./components/chat-client";
import type { ReactElement } from "react";
import { AUTH0_DOMAIN } from "../lib/config";
import { decodeJwt } from "jose";

export default auth0.withPageAuthRequired(
  async function Chat() {
    const session = await auth0.getSession();
    const user = session?.user;

    // Check if the OIDC connection has been added to My Account API has been connected by:
    // 1. Looking for the Auth0 /me/ audience in accessTokens
    // 2. Validating the access token's sub field starts with "oidc|demotradepro-oidc"
    const meAudience = `https://${AUTH0_DOMAIN}/me/`;
    const oidcConnectionPrefix = `oidc|${process.env.API_OIDC_CONNECTION_NAME}`;

    const isAccountConnected =
      session?.accessTokens?.some((token) => {
        if (token.audience !== meAudience) {
          return false;
        }

        // Decode the JWT and check the sub field using jose
        try {
          const decoded = decodeJwt(token.accessToken);
          if (!decoded || !decoded.sub || typeof decoded.sub !== "string") {
            return false;
          }

          return decoded.sub.startsWith(oidcConnectionPrefix);
        } catch (error) {
          console.error("Failed to decode JWT:", error);
          return false;
        }
      }) ?? false;

    return (
      <ChatClient
        user={user!}
        connectionName={process.env.API_OIDC_CONNECTION_NAME!}
        defaultScopes={process.env.API_DEFAULT_SCOPES!}
        apiAudience={process.env.API_AUDIENCE!}
        isAccountConnected={isAccountConnected}
      />
    );
  },
  { returnTo: "/" }
) as unknown as () => Promise<ReactElement>;
