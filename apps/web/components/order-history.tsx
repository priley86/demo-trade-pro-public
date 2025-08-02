import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

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

interface OrderHistoryProps {
  orders: Order[]
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FILLED":
        return "bg-green-600"
      case "PENDING":
        return "bg-yellow-600"
      case "REJECTED":
        return "bg-red-600"
      default:
        return "bg-slate-600"
    }
  }

  const getSideColor = (side: string) => {
    return side === "BUY" ? "bg-green-600" : "bg-red-600"
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No orders yet</p>
            <p className="text-sm text-slate-500 mt-2">Your trading history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Symbol</TableHead>
                  <TableHead className="text-slate-300">Side</TableHead>
                  <TableHead className="text-slate-300">Quantity</TableHead>
                  <TableHead className="text-slate-300">Price</TableHead>
                  <TableHead className="text-slate-300">Total</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-slate-800">
                    <TableCell className="font-medium text-white">{order.symbol}</TableCell>
                    <TableCell>
                      <Badge className={`${getSideColor(order.side)} text-white`}>{order.side}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{order.quantity}</TableCell>
                    <TableCell className="text-slate-300">${order.price}</TableCell>
                    <TableCell className="text-slate-300">
                      ${(Number.parseFloat(order.price) * order.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
