/**
 * Client-side utility to get the access token via API route
 * This should only be used in client components ("use client")
 *
 * Uses the Auth0 Next.js SDK's built-in /api/auth/token endpoint
 * See: https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md#in-the-browser-1
 */
export async function getAccessToken(): Promise<string> {
  const response = await fetch("/api/auth/token");

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.accessToken) {
    throw new Error("No access token returned");
  }

  return data.accessToken;
}
