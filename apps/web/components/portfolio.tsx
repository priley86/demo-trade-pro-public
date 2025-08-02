import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface Order {
  id: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
  price: string
  status: "PENDING" | "FILLED" | "REJECTED"
  createdAt: string
  updatedAt: string
}

interface Stock {
  symbol: string
  name: string
  price: string
  updatedAt: string
}

interface PortfolioProps {
  orders: Order[]
  stocks: Stock[]
}

interface Position {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

export default function Portfolio({ orders, stocks }: PortfolioProps) {
  // Calculate positions from orders
  const positions: Position[] = []
  const filledOrders = orders.filter((order) => order.status === "FILLED")

  // Group orders by symbol
  const ordersBySymbol = filledOrders.reduce(
    (acc, order) => {
      if (!acc[order.symbol]) {
        acc[order.symbol] = []
      }
      acc[order.symbol]?.push(order)
      return acc
    },
    {} as Record<string, Order[]>,
  )

  // Calculate positions
  Object.entries(ordersBySymbol).forEach(([symbol, symbolOrders]) => {
    let totalQuantity = 0
    let totalCost = 0

    symbolOrders.forEach((order) => {
      const quantity = order.side === "BUY" ? order.quantity : -order.quantity
      const cost =
        order.side === "BUY"
          ? Number.parseFloat(order.price) * order.quantity
          : -Number.parseFloat(order.price) * order.quantity

      totalQuantity += quantity
      totalCost += cost
    })

    if (totalQuantity > 0) {
      const stock = stocks.find((s) => s.symbol === symbol)
      if (stock) {
        const avgPrice = totalCost / totalQuantity
        const currentPrice = Number.parseFloat(stock.price)
        const totalValue = currentPrice * totalQuantity
        const gainLoss = totalValue - totalCost
        const gainLossPercent = (gainLoss / totalCost) * 100

        positions.push({
          symbol,
          name: stock.name,
          quantity: totalQuantity,
          avgPrice,
          currentPrice,
          totalValue,
          gainLoss,
          gainLossPercent,
        })
      }
    }
  })

  const totalPortfolioValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0)
  const totalGainLoss = positions.reduce((sum, pos) => sum + pos.gainLoss, 0)
  const totalGainLossPercent =
    totalPortfolioValue > 0 ? (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Return</p>
              <div className="flex items-center">
                {totalGainLossPercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalGainLossPercent >= 0 ? "+" : ""}
                  {totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Current Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No positions yet</p>
              <p className="text-sm text-slate-500 mt-2">Start trading to build your portfolio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.symbol} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">{position.symbol}</h3>
                      <p className="text-slate-400 text-sm">{position.name}</p>
                    </div>
                    <Badge className={`${position.gainLoss >= 0 ? "bg-green-600" : "bg-red-600"} text-white`}>
                      {position.gainLoss >= 0 ? "+" : ""}
                      {position.gainLossPercent.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Quantity</p>
                      <p className="text-white font-medium">{position.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Avg Price</p>
                      <p className="text-white font-medium">${position.avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Current Price</p>
                      <p className="text-white font-medium">${position.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Value</p>
                      <p className="text-white font-medium">${position.totalValue.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Unrealized P&L</span>
                      <span className={`font-bold ${position.gainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {position.gainLoss >= 0 ? "+" : ""}${position.gainLoss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
