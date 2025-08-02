"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { AlertCircle, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"

interface Stock {
  symbol: string
  name: string
  price: string
  updatedAt: string
}

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  stock: Stock | null
  stocks: Stock[]
  onTradeComplete: () => void
}

export default function TradingModal({ isOpen, onClose, stock, stocks, onTradeComplete }: TradingModalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(stock?.symbol || "")
  const [side, setSide] = useState<"BUY" | "SELL">("BUY")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side,
          quantity: Number.parseInt(quantity),
          price: Number.parseFloat(price),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to place order")
      }

      onTradeComplete()
      onClose()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedSymbol("")
    setSide("BUY")
    setQuantity("")
    setPrice("")
    setError("")
  }

  const totalValue = quantity && price ? (Number.parseInt(quantity) * Number.parseFloat(price)).toFixed(2) : "0.00"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Place Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-600 bg-red-600/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol" className="text-slate-300">
                Stock Symbol
              </Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {stocks.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{stock.symbol}</span>
                        <span className="text-slate-400 ml-2">${stock.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStock && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedStock.name}</p>
                      <p className="text-sm text-slate-400">Current Price</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${selectedStock.price}</p>
                      <Badge className="bg-green-600">Live</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="side" className="text-slate-300">
                Order Type
              </Label>
              <Select value={side} onValueChange={(value: "BUY" | "SELL") => setSide(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="BUY">
                    <span className="text-green-400">BUY</span>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <span className="text-red-400">SELL</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-slate-300">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-slate-300">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
            </div>

            {quantity && price && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="text-slate-300">Total Value</span>
                    </div>
                    <span className="text-xl font-bold">${totalValue}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 hover:bg-slate-800 bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${side === "BUY" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              disabled={loading || !selectedSymbol || !quantity || !price}
            >
              {loading ? "Placing..." : `${side} ${selectedSymbol}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
