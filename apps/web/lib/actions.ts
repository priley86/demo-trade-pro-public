"use server";

import { auth0 } from "./auth0";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// Helper function for authenticated API calls
async function authenticatedApiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const session = await auth0.getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  const tokenResponse = await auth0.getAccessToken();
  const token = tokenResponse?.token;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.error("API call failed:", {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      token: token,
    });
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Public actions (no auth required)
export async function getStocks() {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    if (!response.ok) {
      throw new Error("Failed to fetch stocks");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stocks:", error);
    throw error;
  }
}

// Protected actions (auth required)
export async function getPortfolio() {
  return authenticatedApiCall("/portfolio");
}

export async function getOrders() {
  return authenticatedApiCall("/orders");
}

export async function createOrder(orderData: {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}) {
  return authenticatedApiCall("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

// Get current user session (server-side)
export async function getCurrentUser() {
  const session = await auth0.getSession();
  return session?.user || null;
}
