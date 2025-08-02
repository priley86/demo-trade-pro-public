"use client"
import { Badge } from "@workspace/ui/components/badge"

interface Stock {
  symbol: string
  name: string
  price: string
  updatedAt: string
}

interface StockListProps {
  stocks: Stock[]
  selectedStock: string
  onSelectStock: (symbol: string) => void
}

export default function StockList({ stocks, selectedStock, onSelectStock }: StockListProps) {
  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <div
          key={stock.symbol}
          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedStock === stock.symbol ? "border-primary bg-primary/5" : "hover:bg-muted/50"
          }`}
          onClick={() => onSelectStock(stock.symbol)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{stock.symbol}</div>
              <div className="text-sm text-muted-foreground">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">${stock.price}</div>
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
