'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { TrendingUp, TrendingDown, Eye } from "lucide-react"
import Link from "next/link"
import QuickTradeModal from "./quick-trade-modal"

interface DashboardClientProps {
  stocks: any[]
  portfolio: any
  orders: any[]
}

export default function DashboardClient({ stocks, portfolio, orders }: DashboardClientProps) {
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [showQuickTrade, setShowQuickTrade] = useState(false)

  const handleQuickTrade = (stock: any) => {
    setSelectedStock(stock)
    setShowQuickTrade(true)
  }

  const handleTradeComplete = () => {
    setShowQuickTrade(false)
    // In a real app, you might want to refresh data here
    // For now, we'll rely on the server component refresh
  }

  return (
    <>
      {/* Market Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Market Overview</h2>
          <Badge variant="outline">Live Prices</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stocks.map((stock) => (
            <Card key={stock.symbol} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${stock.price}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleQuickTrade(stock)}
                  >
                    Trade
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/stocks/${stock.symbol}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Orders</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">View All</Link>
            </Button>
          </div>
          
          <div className="space-y-2">
            {orders.slice(0, 5).map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant={order.side === 'BUY' ? 'default' : 'secondary'}>
                        {order.side}
                      </Badge>
                      <div>
                        <p className="font-medium">{order.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} shares @ ${order.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          order.status === 'FILLED' ? 'default' : 
                          order.status === 'PENDING' ? 'secondary' : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Holdings */}
      {portfolio?.holdings && portfolio.holdings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Portfolio Holdings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.holdings.map((holding: any) => {
              const stock = stocks.find(s => s.symbol === holding.symbol)
              const currentValue = stock ? Number.parseFloat(stock.price) * holding.shares : 0
              
              return (
                <Card key={holding.symbol}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">{holding.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${currentValue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{holding.shares} shares</p>
                      </div>
                    </div>
                    {stock && (
                      <p className="text-sm">Current: ${stock.price}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <QuickTradeModal
        isOpen={showQuickTrade}
        onClose={() => setShowQuickTrade(false)}
        stock={selectedStock}
        onTradeComplete={handleTradeComplete}
      />
    </>
  )
}
