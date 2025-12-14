import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const team = await sql`SELECT * FROM teams WHERE id = ${teamId}`

    if (team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Get team's squad
    const squad = await sql`
      SELECT sp.*, p.name, p.role, p.photo_url
      FROM sold_players sp
      JOIN players p ON sp.player_id = p.id
      WHERE sp.team_id = ${teamId}
      ORDER BY sp.sold_at DESC
    `

    return NextResponse.json({
      ...team[0],
      remaining_budget: Number(team[0].remaining_budget),
      initial_budget: Number(team[0].initial_budget),
      squad: squad.map((player: any) => ({
        ...player,
        final_price: Number(player.final_price),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching team data:", error)
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 })
  }
}
