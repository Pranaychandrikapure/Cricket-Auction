"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Trash2 } from "lucide-react"

export function PlayerManagement() {
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Batsman",
    batting_style: "Right-hand bat",
    bowling_style: "Right-arm fast",
    base_price: "10",
    description: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    try {
      const response = await fetch("/api/players")
      const data = await response.json()
      setPlayers(data.players || [])
    } catch (error) {
      console.error("Error fetching players:", error)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      let photoUrl = ""

      // Upload photo if selected
      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append("file", photoFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: photoFormData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          photoUrl = uploadData.url
        }
      }

      // Create player
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          base_price: Number.parseFloat(formData.base_price),
          photo_url: photoUrl,
        }),
      })

      if (response.ok) {
        alert("Player added successfully!")
        setShowAddForm(false)
        setFormData({
          name: "",
          email: "",
          role: "Batsman",
          batting_style: "Right-hand bat",
          bowling_style: "Right-arm fast",
          base_price: "10",
          description: "",
        })
        setPhotoFile(null)
        setPhotoPreview("")
        fetchPlayers()
      } else {
        alert("Failed to add player")
      }
    } catch (error) {
      console.error("Error adding player:", error)
      alert("Error adding player")
    } finally {
      setIsLoading(false)
    }
  }

  async function deletePlayer(playerId: number) {
    if (!confirm("Are you sure you want to delete this player?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Player deleted successfully!")
        fetchPlayers()
      } else {
        alert("Failed to delete player")
      }
    } catch (error) {
      console.error("Error deleting player:", error)
      alert("Error deleting player")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Player Management</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "Add New Player"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Player Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Batsman</option>
                    <option>Bowler</option>
                    <option>All-rounder</option>
                    <option>Wicket-keeper</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price (Lakhs)</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.5"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batting_style">Batting Style</Label>
                  <select
                    id="batting_style"
                    value={formData.batting_style}
                    onChange={(e) => setFormData({ ...formData, batting_style: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Right-hand bat</option>
                    <option>Left-hand bat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bowling_style">Bowling Style</Label>
                  <select
                    id="bowling_style"
                    value={formData.bowling_style}
                    onChange={(e) => setFormData({ ...formData, bowling_style: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Right-arm fast</option>
                    <option>Left-arm fast</option>
                    <option>Right-arm medium</option>
                    <option>Left-arm medium</option>
                    <option>Right-arm spin</option>
                    <option>Left-arm spin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Player Photo</Label>
                <div className="flex items-center gap-4">
                  <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                  {photoPreview && (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Player"}
              </Button>
            </form>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">All Players ({players.length})</h3>
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  {player.photo_url && (
                    <img
                      src={player.photo_url || "/placeholder.svg"}
                      alt={player.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.role} • ${player.base_price}L • {player.email}
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deletePlayer(player.id)} disabled={isLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
