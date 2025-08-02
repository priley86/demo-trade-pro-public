import { Badge } from "@workspace/ui/components/badge"

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

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders yet. Place your first trade to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={order.side === "BUY" ? "default" : "destructive"}>{order.side}</Badge>
              <span className="font-medium">{order.symbol}</span>
            </div>
            <Badge
              variant={order.status === "FILLED" ? "default" : order.status === "PENDING" ? "secondary" : "destructive"}
            >
              {order.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Quantity</div>
              <div className="font-medium">{order.quantity}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Price</div>
              <div className="font-medium">${order.price}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-medium">${(Number.parseFloat(order.price) * order.quantity).toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
