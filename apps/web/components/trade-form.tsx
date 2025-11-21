"use client";

import type React from "react";

import { useState } from "react";
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
import { AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { auth0 } from "@/lib/auth0";

interface Stock {
  symbol: string;
  name: string;
  price: string;
  updatedAt: string;
}

interface TradeFormProps {
  stocks: Stock[];
  selectedStock: string;
  onTradeComplete: () => void;
}

export default function TradeForm({
  stocks,
  selectedStock,
  onTradeComplete,
}: TradeFormProps) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update symbol when selectedStock changes
  useState(() => {
    if (selectedStock) {
      setSymbol(selectedStock);
      const stock = stocks.find((s) => s.symbol === selectedStock);
      if (stock) {
        setPrice(stock.price);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Verify user is authenticated
      const token = await auth0.getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol,
          side,
          quantity: Number.parseInt(quantity),
          price: Number.parseFloat(price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const order = await response.json();
      setSuccess(`Order placed successfully! ID: ${order.id}`);
      setQuantity("");
      onTradeComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedStockData = stocks.find((s) => s.symbol === symbol);
  const totalValue =
    quantity && price
      ? (Number.parseInt(quantity) * Number.parseFloat(price)).toFixed(2)
      : "0.00";

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
        <Label htmlFor="symbol">Stock</Label>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger>
            <SelectValue placeholder="Select a stock" />
          </SelectTrigger>
          <SelectContent>
            {stocks.map((stock) => (
              <SelectItem key={stock.symbol} value={stock.symbol}>
                {stock.symbol} - ${stock.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="side">Side</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0.01"
            required
          />
        </div>
      </div>

      {selectedStockData && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Current Price</div>
          <div className="font-medium">${selectedStockData.price}</div>
        </div>
      )}

      {quantity && price && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">Total Value</div>
          <div className="font-bold text-lg">${totalValue}</div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !symbol || !quantity || !price}
      >
        {loading ? "Placing Order..." : `${side} ${symbol || "Stock"}`}
      </Button>
    </form>
  );
}
