"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Gavel, UserPlus } from "lucide-react"
import { PlayerManagement } from "@/components/player-management"
import emailjs from "@emailjs/browser"

interface AdminControlsProps {
  teams: any[]
  players: any[]
  auctionState: any
  soldPlayers: any[]
}

export function AdminControls({ teams, players, auctionState, soldPlayers }: AdminControlsProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [countdownTime, setCountdownTime] = useState(10)
  const [isMagicCard, setIsMagicCard] = useState(false)
  const [magicCardType, setMagicCardType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tickSize, setTickSize] = useState(auctionState?.tick_size || 10)
  const [showPlayerManagement, setShowPlayerManagement] = useState(false)

  const availablePlayers = players.filter(
    (player: any) => !soldPlayers.some((sold: any) => sold.player_id === player.id),
  )

  async function startAuction() {
    if (!selectedPlayer) {
      alert("Please select a player")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auction/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: Number.parseInt(selectedPlayer),
          countdownSeconds: countdownTime,
          isMagicCard,
          magicCardType: isMagicCard ? magicCardType : null,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert("Failed to start auction")
      }
    } catch (error) {
      console.error("Error starting auction:", error)
      alert("Error starting auction")
    } finally {
      setIsLoading(false)
    }
  }

  async function pauseAuction() {
    setIsLoading(true)
    try {
      await fetch("/api/auction/pause", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Error pausing auction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function resumeAuction() {
    setIsLoading(true)
    try {
      await fetch("/api/auction/resume", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Error resuming auction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function resetAuction() {
    if (!confirm("Are you sure you want to reset the entire auction? This will clear all bids and sold players.")) {
      return
    }

    setIsLoading(true)
    try {
      await fetch("/api/auction/reset", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Error resetting auction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function sellPlayer() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auction/sell", { method: "POST" })
      const data = await response.json() 

      if (response.ok) {
        const currentPlayer = players.find((p) => p.id === auctionState.current_player_id)

        if (currentPlayer && currentPlayer.email) {
            console.log("Attempting to send email to:", currentPlayer.email)
            try {
                await emailjs.send(
                    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                    {
                        email: currentPlayer.email,
                        player_name: currentPlayer.name,
                        team_name: data.team
                    },
                    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
                )
                console.log("Email sent successfully")
            } catch (emailError) {
                console.error("Failed to send email via EmailJS:", emailError)
                // We do NOT stop the function here; the player is already sold in DB.
            }
        }

        alert(`Player sold to ${data.team} for $${data.price}L!`)
        window.location.reload()
      } else {
        alert(data.error || "Failed to sell player")
      }
    } catch (error) {
      console.error("Error selling player:", error)
      alert("Error selling player")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTickSize(event: any) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auction/tick-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickSize: Number.parseFloat(event.target.value) || 10 }),
      })

      if (response.ok) {
        alert("Tick size updated successfully")
      } else {
        alert("Failed to update tick size")
      }
    } catch (error) {
      console.error("Error updating tick size:", error)
      alert("Error updating tick size")
    } finally {
      setIsLoading(false)
    }
  }

  if (showPlayerManagement) {
    return (
      <div>
        <Button onClick={() => setShowPlayerManagement(false)} className="mb-4">
          Back to Auction Controls
        </Button>
        <PlayerManagement />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowPlayerManagement(true)} variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Manage Players
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start New Auction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Player</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.map((player: any) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} - {player.role} (Base: ${player.base_price}L)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Countdown Time (seconds)</Label>
              <Input
                type="number"
                value={countdownTime}
                onChange={(e) => setCountdownTime(Number.parseInt(e.target.value) || 10)}
                min="5"
                max="60"
              />
            </div>

            <div className="space-y-2">
              <Label>Tick Size (Minimum Bid Increment)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={tickSize}
                  onChange={updateTickSize}
                  min="0.5"
                  step="0.5"
                  className="flex-1"
                />
                <Button onClick={() => {}} disabled={isLoading} variant="outline">
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Current: ${auctionState?.tick_size || 10}L</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="magic-card"
                checked={isMagicCard}
                onChange={(e) => setIsMagicCard(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="magic-card">This is a Magic Card player</Label>
            </div>

            {isMagicCard && (
              <div className="space-y-2">
                <Label>Magic Card Type</Label>
                <Select value={magicCardType} onValueChange={setMagicCardType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose magic card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="double_or_nothing">Double or Nothing</SelectItem>
                    <SelectItem value="steal_bid">Steal the Bid</SelectItem>
                    <SelectItem value="extra_time">Extra Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={startAuction} disabled={isLoading} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Auction
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auction Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current State</p>
              <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
                <p className="text-lg font-bold capitalize">{auctionState?.state || "Idle"}</p>
                {auctionState?.current_player_id && (
                  <p className="text-sm text-muted-foreground">Player ID: {auctionState.current_player_id}</p>
                )}
                {auctionState?.current_bid && (
                  <p className="text-sm text-muted-foreground">Current Bid: ${auctionState.current_bid}L</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              {auctionState?.state === "active" && (
                <>
                  <Button onClick={pauseAuction} disabled={isLoading} variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Auction
                  </Button>
                  <Button onClick={sellPlayer} disabled={isLoading} variant="default">
                    <Gavel className="mr-2 h-4 w-4" />
                    Sell to Current Bidder
                  </Button>
                </>
              )}

              {auctionState?.state === "paused" && (
                <Button onClick={resumeAuction} disabled={isLoading}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Auction
                </Button>
              )}

              <Button onClick={resetAuction} disabled={isLoading} variant="destructive">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Entire Auction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
