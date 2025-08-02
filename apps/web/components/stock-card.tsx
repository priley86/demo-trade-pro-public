"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: string
  updatedAt: string
}

interface StockCardProps {
  stock: Stock
  onTrade: (stock: Stock) => void
}

export default function StockCard({ stock, onTrade }: StockCardProps) {
  // Simulate price change for demo
  const priceChange = (Math.random() - 0.5) * 10
  const isPositive = priceChange > 0

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white">{stock.symbol}</CardTitle>
            <p className="text-sm text-slate-400 truncate">{stock.name}</p>
          </div>
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className={`${isPositive ? "bg-green-600" : "bg-red-600"} text-white`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(priceChange).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold text-white">${stock.price}</p>
          <p className="text-sm text-slate-400">Updated {new Date(stock.updatedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => onTrade(stock)} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
            Buy
          </Button>
          <Button
            onClick={() => onTrade(stock)}
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            size="sm"
          >
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
