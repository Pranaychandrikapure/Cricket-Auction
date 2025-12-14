"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Users, DollarSign } from "lucide-react"

interface TeamDashboardProps {
  team: any
  isLocked?: boolean
}

export function TeamDashboard({ team, isLocked = false }: TeamDashboardProps) {
  const [selectedTeamId] = useState<string>(team.id.toString())
  const [auctionData, setAuctionData] = useState<any>(null)
  const [bidAmount, setBidAmount] = useState<string>("")
  const [teamData, setTeamData] = useState<any>(null)
  const [magicCards, setMagicCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedTeamId) return

    async function fetchTeamData() {
      try {
        const [auctionRes, teamRes, magicRes] = await Promise.all([
          fetch("/api/auction/state"),
          fetch(`/api/teams/${selectedTeamId}`),
          fetch(`/api/teams/${selectedTeamId}/magic-cards`),
        ])

        const auction = await auctionRes.json()
        const team = await teamRes.json()
        const cards = await magicRes.json()

        setAuctionData(auction)
        setTeamData(team)
        setMagicCards(cards)

        if (auction.currentBid && auction.state === "active") {
          const tickSize = auction.tickSize || 0.5
          setBidAmount((Number.parseFloat(auction.currentBid) + tickSize).toFixed(2))
        }
      } catch (error) {
        console.error("Error fetching team data:", error)
      }
    }

    fetchTeamData()
    const interval = setInterval(fetchTeamData, 1000)
    return () => clearInterval(interval)
  }, [selectedTeamId])

  const placeBid = async () => {
    if (!selectedTeamId || !bidAmount) return

    const bid = Number.parseFloat(bidAmount)
    if (bid <= auctionData.currentBid) {
      alert("Bid must be higher than current bid")
      return
    }

    if (bid > teamData.remaining_budget) {
      alert("Insufficient budget")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: Number.parseInt(selectedTeamId),
          bidAmount: bid,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to place bid")
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      alert("Error placing bid")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseMagicCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to use this magic card?")) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/magic-cards/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, teamId: Number.parseInt(selectedTeamId) }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to use magic card")
      }
    } catch (error) {
      console.error("Error using magic card:", error)
      alert("Error using magic card")
    } finally {
      setIsLoading(false)
    }
  }

  const hasPremiumPlayer = teamData?.has_premium_player || false
  const maxBidAllowed = hasPremiumPlayer ? 10 : 30

  if (!auctionData || !teamData) {
    return <p className="text-center text-white">Loading team dashboard...</p>
  }

  const tickSize = auctionData.tickSize || 0.5

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-2 border-primary">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{team.name}</h2>
                <p className="text-sm text-muted-foreground">{team.short_name}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-green-600">${Number(teamData.remaining_budget).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Squad</p>
                <p className="text-2xl font-bold">{teamData.squad?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Bid</p>
                <p className="text-2xl font-bold text-orange-600">{maxBidAllowed}L</p>
              </div>
            </div>
          </div>
          {hasPremiumPlayer && (
            <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500 rounded-lg">
              <p className="text-xs text-orange-600 font-medium">
                Premium slot used. Maximum bid now limited to 10L for remaining players.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Auction</CardTitle>
            </CardHeader>
            <CardContent>
              {auctionData.state === "idle" || auctionData.state === "sold" ? (
                <p className="text-center text-muted-foreground">Waiting for next player...</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={auctionData.player?.photo_url || "/placeholder.svg?height=100&width=100"}
                      alt={auctionData.player?.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{auctionData.player?.name}</h3>
                      <p className="text-sm text-muted-foreground">{auctionData.player?.role}</p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Base</p>
                          <p className="font-bold">${auctionData.player?.base_price}L</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current</p>
                          <p className="font-bold text-green-600">${auctionData.currentBid}L</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {auctionData.state === "active" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step={tickSize}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter bid"
                        />
                        <Button onClick={placeBid} disabled={isLoading}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Bid
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBidAmount((Number.parseFloat(auctionData.currentBid) + tickSize).toFixed(2))
                          }
                        >
                          +{tickSize}L
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBidAmount((Number.parseFloat(auctionData.currentBid) + tickSize * 2).toFixed(2))
                          }
                        >
                          +{(tickSize * 2).toFixed(1)}L
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Bids - All Teams</CardTitle>
            </CardHeader>
            <CardContent>
              {!auctionData.bidHistory || auctionData.bidHistory.length === 0 ? (
                <p className="text-center text-muted-foreground">No bids yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auctionData.bidHistory.map((bid: any, index: number) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        index === 0 ? "bg-green-500/10 border border-green-500" : "bg-muted"
                      }`}
                    >
                      <span className="text-sm font-medium">{bid.team_name}</span>
                      <span className="text-sm font-bold text-green-600">${bid.bid_amount}L</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Users className="mr-2 h-4 w-4" />
                My Squad ({teamData.squad?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!teamData.squad || teamData.squad.length === 0 ? (
                <p className="text-center text-muted-foreground">No players yet</p>
              ) : (
                <div className="space-y-2">
                  {teamData.squad.map((player: any) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <img
                          src={player.photo_url || "/placeholder.svg?height=40&width=40"}
                          alt={player.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.role}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-green-600">${player.final_price}L</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Sparkles className="mr-2 h-4 w-4" />
                Magic Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {magicCards.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">No cards</p>
              ) : (
                magicCards.map((card) => (
                  <Card key={card.id} className={card.is_used ? "opacity-50" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold capitalize">{card.card_type.replace("_", " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {card.card_type === "double_or_nothing" && "Double bid or lose"}
                            {card.card_type === "steal_bid" && "Steal current bid"}
                            {card.card_type === "extra_time" && "+10 seconds"}
                          </p>
                        </div>
                        {!card.is_used && auctionData.state === "active" && (
                          <Button size="sm" onClick={() => handleUseMagicCard(card.id)} disabled={isLoading}>
                            Use
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
