"use client"

import type React from "react"

import { useState } from "react"
import { createOrder } from "@/lib/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { AlertCircle } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: string
  updatedAt: string
}

interface QuickTradeModalProps {
  isOpen: boolean
  onClose: () => void
  stock: Stock | null
  onTradeComplete: () => void
}

export default function QuickTradeModal({ isOpen, onClose, stock, onTradeComplete }: QuickTradeModalProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stock) return

    setLoading(true)
    setError("")

    try {
      await createOrder({
        symbol: stock.symbol,
        side,
        quantity: Number.parseInt(quantity),
        price: Number.parseFloat(stock.price),
      })

      onTradeComplete()
      onClose()
      setQuantity("")
      setSide("BUY")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!stock) return null

  const totalValue = quantity ? Number.parseFloat(quantity) * Number.parseFloat(stock.price) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Trade - {stock.symbol}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{stock.name}</div>
                <div className="text-sm text-muted-foreground">Current Price</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${stock.price}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select value={side} onValueChange={(value: "BUY" | "SELL") => setSide(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">BUY</SelectItem>
                <SelectItem value="SELL">SELL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Number of shares"
              min="1"
              required
            />
          </div>

          {totalValue > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-bold">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !quantity}>
              {loading ? "Placing..." : `${side} ${stock.symbol}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
