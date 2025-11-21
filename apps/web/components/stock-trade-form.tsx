"use client";

import type React from "react";

import { useState } from "react";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Card, CardContent } from "@workspace/ui/components/card";
import { AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Stock {
  symbol: string;
  name: string;
  price: string;
  updatedAt: string;
}

interface StockTradeFormProps {
  stock: Stock;
  cashBalance: string;
  currentShares: number;
  onTradeComplete: () => void;
}

export default function StockTradeForm({
  stock,
  cashBalance,
  currentShares,
  onTradeComplete,
}: StockTradeFormProps) {
  const { user } = useUser();
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user) {
        throw new Error("Authentication required");
      }

      // Get access token from Auth0
      const token = await getAccessToken();

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          side,
          quantity: Number.parseInt(quantity),
          price: Number.parseFloat(stock.price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      setSuccess(`${side} order placed successfully!`);
      setQuantity("");
      onTradeComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const cash = Number.parseFloat(cashBalance);
  const totalValue = quantity
    ? Number.parseInt(quantity) * Number.parseFloat(stock.price)
    : 0;
  const canAfford = side === "BUY" ? totalValue <= cash : true;
  const hasShares =
    side === "SELL" ? currentShares >= Number.parseInt(quantity || "0") : true;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Order Type</Label>
        <Select
          value={side}
          onValueChange={(value: "BUY" | "SELL") => setSide(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BUY">BUY</SelectItem>
            <SelectItem value="SELL">SELL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Number of shares"
          min="1"
          required
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Price per Share:</span>
            <span className="font-medium">${stock.price}</span>
          </div>
          {quantity && (
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-bold">${totalValue.toFixed(2)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Available Cash:</span>
          <span
            className={
              side === "BUY" && !canAfford ? "text-red-600" : "text-green-600"
            }
          >
            ${cash.toFixed(2)}
          </span>
        </div>
        {currentShares > 0 && (
          <div className="flex justify-between">
            <span>Shares Owned:</span>
            <span
              className={
                side === "SELL" && !hasShares
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {currentShares}
            </span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !quantity || !canAfford || !hasShares}
      >
        {loading ? "Placing Order..." : `${side} ${quantity || "0"} Shares`}
      </Button>
    </form>
  );
}
