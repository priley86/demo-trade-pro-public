"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
import { Badge } from "@workspace/ui/components/badge";
import { AlertCircle, DollarSign } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Stock {
  symbol: string;
  name: string;
  price: string;
  updatedAt: string;
}

interface Portfolio {
  cashBalance: string;
  holdings: Array<{
    symbol: string;
    name: string;
    shares: number;
  }>;
}

export default function TradePage() {
  const { user, isLoading: userLoading } = useUser();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      // Fetch stocks (public)
      const stocksRes = await fetch(`${API_BASE_URL}/stocks`);
      if (stocksRes.ok) setStocks(await stocksRes.json());

      // Fetch portfolio (authenticated) - only if user is logged in
      if (user) {
        const token = await getAccessToken();
        const portfolioRes = await fetch(`${API_BASE_URL}/portfolio`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
      }
    } catch (error) {
      console.log("error", error);
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol);
  const currentHolding = portfolio?.holdings.find(
    (h) => h.symbol === selectedSymbol
  );
  const cashBalance = portfolio ? Number.parseFloat(portfolio.cashBalance) : 0;
  const totalValue =
    quantity && price
      ? Number.parseFloat(quantity) * Number.parseFloat(price)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user) {
        throw new Error("Authentication required");
      }

      const token = await getAccessToken();

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
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
      setSuccess(
        `Order placed successfully! ${side} ${quantity} shares of ${selectedSymbol} at $${price}`
      );

      // Reset form
      setQuantity("");
      setPrice("");

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const canAfford = side === "BUY" ? totalValue <= cashBalance : true;
  const hasShares =
    side === "SELL"
      ? (currentHolding?.shares || 0) >= Number.parseInt(quantity || "0")
      : true;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Center</h1>
        <p className="text-muted-foreground">
          Place your trades with real-time market data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Symbol</Label>
                    <Select
                      value={selectedSymbol}
                      onValueChange={setSelectedSymbol}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock" />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price per Share</Label>
                    <Input
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

                {selectedStock && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {selectedStock.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Price
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${selectedStock.price}
                          </div>
                          <Badge variant="secondary">Live</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {totalValue > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-bold">
                            ${totalValue.toFixed(2)}
                          </span>
                        </div>
                        {side === "BUY" && (
                          <div className="flex justify-between">
                            <span>Available Cash:</span>
                            <span
                              className={
                                canAfford ? "text-green-600" : "text-red-600"
                              }
                            >
                              ${cashBalance.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {side === "SELL" && currentHolding && (
                          <div className="flex justify-between">
                            <span>Shares Owned:</span>
                            <span
                              className={
                                hasShares ? "text-green-600" : "text-red-600"
                              }
                            >
                              {currentHolding.shares}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    !selectedSymbol ||
                    !quantity ||
                    !price ||
                    !canAfford ||
                    !hasShares
                  }
                >
                  {loading
                    ? "Placing Order..."
                    : `${side} ${selectedSymbol || "Stock"}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Cash Balance
                </div>
                <div className="text-2xl font-bold">
                  ${cashBalance.toLocaleString()}
                </div>
              </div>

              {portfolio?.holdings && portfolio.holdings.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Current Holdings
                  </div>
                  <div className="space-y-2">
                    {portfolio.holdings.map((holding) => {
                      const stock = stocks.find(
                        (s) => s.symbol === holding.symbol
                      );
                      const value = stock
                        ? Number.parseFloat(stock.price) * holding.shares
                        : 0;

                      return (
                        <div
                          key={holding.symbol}
                          className="flex justify-between text-sm"
                        >
                          <span>{holding.symbol}</span>
                          <span>
                            {holding.shares} shares (${value.toFixed(2)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
