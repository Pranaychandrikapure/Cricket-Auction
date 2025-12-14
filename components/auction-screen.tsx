"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock } from "lucide-react"

interface AuctionData {
  player: any
  currentBid: number
  currentTeam: any
  state: string
  countdown: number
  isMagicCard: boolean
  magicCardType: string | null
  teams: any[]
  bidHistory: any[]
}

export function AuctionScreen() {
  const [data, setData] = useState<AuctionData | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [showSoldAnimation, setShowSoldAnimation] = useState(false)

  
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/auction/state")
        const newData = await response.json()

        // Check if player was just sold
        if (data?.state === "active" && newData.state === "sold") {
          setShowSoldAnimation(true)
          setTimeout(() => setShowSoldAnimation(false), 5000)
        }
        
        setData(newData)
        setCountdown(newData.countdown || 0)
      } catch (error) {
        console.error("[v0] Error fetching auction data:", error)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [data?.state])
  
  useEffect(() => {
    if (data?.state === "active" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [data?.state, countdown])
  
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <p className="text-2xl text-white">Loading auction...</p>
      </div>
    )
  }

  

  if (data.state === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Trophy className="mx-auto mb-6 h-32 w-32 text-white" />
          <h1 className="mb-4 text-6xl font-bold text-white">Auction Starting Soon</h1>
          <p className="text-2xl text-purple-300">Waiting for admin to start...</p>
        </div>
      </div>
    )
  }

  if (showSoldAnimation && data.currentTeam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <Trophy className="mx-auto h-24 w-24 text-white mb-6" />
          <h1 className="text-6xl font-bold text-white mb-4">SOLD!</h1>
          <p className="text-3xl font-bold text-white mb-2">{data.player?.name}</p>
          <p className="text-2xl text-white mb-4">to {data.currentTeam.name}</p>
          <p className="text-5xl font-bold text-white">${data.currentBid}L</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Live Auction</h1>
          {data.state === "paused" && <Badge className="bg-yellow-500">PAUSED</Badge>}
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <div className="relative">
                <img
                  src={data.player?.photo_url || "/placeholder.svg?height=300&width=600"}
                  alt={data.player?.name}
                  className="w-full h-48 md:h-64 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-white">{data.player?.name}</h2>
                  <p className="text-lg text-slate-300">{data.player?.role}</p>
                </div>
              </div>
              <div className="p-4 md:p-6 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-white text-sm">
                  <div>
                    <p className="text-slate-400">Batting</p>
                    <p className="font-semibold">{data.player?.batting_style || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Bowling</p>
                    <p className="font-semibold">{data.player?.bowling_style || "N/A"}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-white">
                  <div>
                    <p className="text-sm text-slate-400">Base Price</p>
                    <p className="text-xl font-bold">${data.player?.base_price}L</p>
                  </div>
                  {data.currentTeam && (
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Leading</p>
                      <p className="font-bold">{data.currentTeam.short_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="font-bold text-white mb-3">Bid History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {!data.bidHistory || data.bidHistory.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">No bids yet</p>
                ) : (
                  data.bidHistory.slice(0, 5).map((bid: any, index: number) => (
                    <div
                      key={bid.id}
                      className={`flex justify-between p-2 rounded ${index === 0 ? "bg-green-500/20" : "bg-slate-700"}`}
                    >
                      <span className="text-sm text-white">{bid.team_name}</span>
                      <span className="text-sm font-bold text-white">${bid.bid_amount}L</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-4 md:p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-400 mb-1">Time Left</p>
              <div className={`text-5xl font-bold ${countdown <= 3 ? "text-red-500" : "text-white"}`}>{countdown}s</div>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 md:p-6 text-center">
              <p className="text-white/80 text-sm mb-1">Current Bid</p>
              <div className="text-4xl font-bold text-white">${data.currentBid}L</div>
            </Card>
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <h3 className="font-bold text-white mb-3">Teams</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {data.teams && data.teams.length > 0 ? (
              data.teams.map((team: any) => {
                const remainingBudget = team.remaining_budget ? Number(team.remaining_budget) : 0
                return (
                  <div
                    key={team.id}
                    className={`rounded-lg p-3 ${
                      team.id === data.currentTeam?.id ? "bg-green-500/20 border-2 border-green-500" : "bg-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white text-sm">{team.short_name}</p>
                    <p className="text-lg font-bold text-green-400">${remainingBudget.toFixed(1)}L</p>
                  </div>
                )
              })
            ) : (
              <p className="text-slate-400 text-sm col-span-full text-center">No teams</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
