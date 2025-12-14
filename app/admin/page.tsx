import { sql } from "@/lib/db"
import { AdminControls } from "@/components/admin-controls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { Home, Tv, Users } from "lucide-react"

export const dynamic = "force-dynamic"

async function getAuctionData() {
  const [teams, players, auctionState, soldPlayers] = await Promise.all([
    sql`SELECT * FROM teams ORDER BY name`,
    sql`SELECT * FROM players ORDER BY name`,
    sql`SELECT * FROM auction_state LIMIT 1`,
    sql`
      SELECT sp.*, p.name as player_name, t.name as team_name 
      FROM sold_players sp
      JOIN players p ON sp.player_id = p.id
      JOIN teams t ON sp.team_id = t.id
      ORDER BY sp.sold_at DESC
    `,
  ])

  return {
    teams,
    players,
    auctionState: auctionState[0] || null,
    soldPlayers,
  }
}

export default async function AdminPage() {
  const user = await requireAuth("admin")
  const data = await getAuctionData()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Auction Management Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </button>
              </Link>
              <a href="/auction" target="_blank" rel="noreferrer">
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  Auction
                </button>
              </a>
              <a href="/teams" target="_blank" rel="noreferrer">
                <button className="rounded-lg border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </button>
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <AdminControls
          teams={data.teams}
          players={data.players}
          auctionState={data.auctionState}
          soldPlayers={data.soldPlayers}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.teams.map((team: any) => (
                  <div key={team.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-semibold text-sm">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.short_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${Number(team.remaining_budget).toFixed(2)}L</p>
                      <p className="text-xs text-muted-foreground">of ${Number(team.total_budget).toFixed(2)}L</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.soldPlayers.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No sales yet</p>
                ) : (
                  data.soldPlayers.slice(0, 10).map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-semibold text-sm">{sale.player_name}</p>
                        <p className="text-xs text-muted-foreground">{sale.team_name}</p>
                      </div>
                      <p className="font-bold text-green-600">${Number(sale.final_price).toFixed(2)}L</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
