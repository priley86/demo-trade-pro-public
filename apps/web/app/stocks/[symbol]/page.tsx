"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getAccessToken } from "@auth0/nextjs-auth0/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StockTradeForm from "@/components/stock-trade-form";
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

interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: string;
  status: string;
  createdAt: string;
}

export default function StockDetail() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { user } = useUser();

  const [stock, setStock] = useState<Stock | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (!user) {
        throw new Error("Authentication required");
      }

      // Get access token from Auth0
      const token = await getAccessToken();

      const [stockRes, portfolioRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stocks/${symbol}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/portfolio`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (stockRes.ok) setStock(await stockRes.json());
      if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  const handleTradeComplete = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading stock details...</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Stock Not Found</h1>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const currentHolding = portfolio?.holdings.find((h) => h.symbol === symbol);
  const currentValue = currentHolding
    ? Number.parseFloat(stock.price) * currentHolding.shares
    : 0;
  const stockOrders = orders.filter((order) => order.symbol === symbol);

  // Mock price change for demo
  const priceChange = (Math.random() - 0.5) * 8;
  const isPositive = priceChange > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{stock.symbol}</h1>
          <p className="text-muted-foreground">{stock.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">${stock.price}</div>
                  <div
                    className={`flex items-center text-lg ${isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {isPositive ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </div>
                </div>
                <Badge className="bg-green-600">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date(stock.updatedAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          {/* Your Position */}
          <Card>
            <CardHeader>
              <CardTitle>Your Position</CardTitle>
            </CardHeader>
            <CardContent>
              {currentHolding ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Shares Owned
                      </div>
                      <div className="text-2xl font-bold">
                        {currentHolding.shares}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Current Value
                      </div>
                      <div className="text-2xl font-bold">
                        ${currentValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Unrealized P&L
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      +${(currentValue * 0.05).toFixed(2)} (+5.0%)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>You don't own any shares of {stock.symbol}</p>
                  <p className="text-sm">Use the trading form to buy shares</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders for {stock.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              {stockOrders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No orders for {stock.symbol} yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            order.side === "BUY" ? "default" : "destructive"
                          }
                        >
                          {order.side}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {order.quantity} shares
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @ ${order.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          $
                          {(
                            Number.parseFloat(order.price) * order.quantity
                          ).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trading Form */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Trade {stock.symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <StockTradeForm
                stock={stock}
                cashBalance={portfolio?.cashBalance || "0"}
                currentShares={currentHolding?.shares || 0}
                onTradeComplete={handleTradeComplete}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
