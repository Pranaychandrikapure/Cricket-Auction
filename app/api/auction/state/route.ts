import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const auctionState = await sql`SELECT * FROM auction_state LIMIT 1`
    const state = auctionState[0]

    let player = null
    let currentTeam = null
    let bidHistory: any[] = []

    if (state.current_player_id) {
      const playerResult = await sql`SELECT * FROM players WHERE id = ${state.current_player_id}`
      player = playerResult[0]

      if (player) {
        player.base_price = Number(player.base_price)
      }

      bidHistory = await sql`
        SELECT bh.*, t.name as team_name, t.short_name
        FROM bid_history bh
        JOIN teams t ON bh.team_id = t.id
        WHERE bh.player_id = ${state.current_player_id}
        ORDER BY bh.created_at DESC
      `

      bidHistory = bidHistory.map((bid: any) => ({
        ...bid,
        bid_amount: Number(bid.bid_amount),
      }))
    }

    if (state.current_team_id) {
      const teamResult = await sql`SELECT * FROM teams WHERE id = ${state.current_team_id}`
      currentTeam = teamResult[0]

      if (currentTeam) {
        currentTeam.remaining_budget = Number(currentTeam.remaining_budget)
        currentTeam.initial_budget = Number(currentTeam.initial_budget)
      }
    }

    const teams = await sql`SELECT * FROM teams ORDER BY name`

    const teamsWithNumbers = teams.map((team: any) => ({
      ...team,
      remaining_budget: Number(team.remaining_budget),
      initial_budget: Number(team.initial_budget),
      total_budget: Number(team.initial_budget), // total_budget is the same as initial_budget
    }))

    return NextResponse.json({
      player,
      currentBid: state.current_bid ? Number(state.current_bid) : 0,
      currentTeam,
      state: state.state,
      countdown: state.countdown_seconds,
      isMagicCard: state.is_magic_card,
      magicCardType: state.magic_card_type,
      tickSize: state.tick_size ? Number(state.tick_size) : 0.5,
      teams: teamsWithNumbers,
      bidHistory,
    })
  } catch (error) {
    console.error("Error fetching auction state:", error)
    return NextResponse.json({ error: "Failed to fetch auction state" }, { status: 500 })
  }
}
