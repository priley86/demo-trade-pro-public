import { getStocks, getPortfolio, getOrders, getCurrentUser } from '@/lib/actions'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"
import DashboardClient from './dashboard-client'

export default async function DashboardServer() {
  const user = await getCurrentUser()
  
  // Always fetch public stock data
  const stocks = await getStocks()
  
  // Only fetch protected data if user is authenticated
  let portfolio = null
  let orders = []
  
  if (user) {
    try {
      [portfolio, orders] = await Promise.all([
        getPortfolio(),
        getOrders()
      ])
    } catch (error) {
      console.error('Error fetching protected data:', error)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to DemoTradePro</h1>
          <p className="text-muted-foreground mb-8">Professional stock trading platform</p>
          <div className="space-x-4">
            <Button asChild>
              <a href="/auth/login?screen_hint=signup">Get Started</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/auth/login">Login</a>
            </Button>
          </div>
        </div>
        
        {/* Public stock data */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stocks.map((stock: any) => (
              <Card key={stock.symbol}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${stock.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Calculate portfolio metrics
  const cashBalance = portfolio ? Number.parseFloat(portfolio.cashBalance) : 0
  const investedValue = portfolio?.holdings.reduce((total: number, holding: any) => {
    const stock = stocks.find((s: any) => s.symbol === holding.symbol)
    return total + (stock ? Number.parseFloat(stock.price) * holding.shares : 0)
  }, 0) || 0
  const totalValue = cashBalance + investedValue

  // Mock daily P&L (in real app, this would come from API)
  const dailyPL = investedValue * 0.015 // Simulate 1.5% daily gain
  const dailyPLPercent = totalValue > 0 ? (dailyPL / totalValue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Cash: ${cashBalance.toFixed(2)} | Invested: ${investedValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
            {dailyPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(dailyPL).toFixed(2)}
            </div>
            <p className={`text-xs ${dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyPL >= 0 ? '+' : '-'}{Math.abs(dailyPLPercent).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter((o: any) => o.status === 'PENDING').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio?.holdings.length || 0}</div>
            <p className="text-xs text-muted-foreground">Different stocks</p>
          </CardContent>
        </Card>
      </div>

      {/* Pass data to client component for interactive features */}
      <DashboardClient 
        stocks={stocks} 
        portfolio={portfolio} 
        orders={orders} 
      />
    </div>
  )
}
