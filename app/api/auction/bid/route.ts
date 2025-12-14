import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { teamId, bidAmount } = await request.json()

    // Check auction state
    const auctionState = await sql`SELECT * FROM auction_state LIMIT 1`
    const state = auctionState[0]

    if (state.state !== "active") {
      return NextResponse.json({ error: "Auction is not active" }, { status: 400 })
    }

    const currentBid = Number(state.current_bid || 0)

    // Check if bid is valid
    if (bidAmount <= currentBid) {
      return NextResponse.json({ error: "Bid must be higher than current bid" }, { status: 400 })
    }

    // Check team budget
    const team = await sql`SELECT * FROM teams WHERE id = ${teamId}`
    if (team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const remainingBudget = Number(team[0].remaining_budget)
    if (bidAmount > remainingBudget) {
      return NextResponse.json({ error: "Insufficient budget" }, { status: 400 })
    }

    // Update auction state
    await sql`
      UPDATE auction_state 
      SET 
        current_bid = ${bidAmount},
        current_team_id = ${teamId},
        updated_at = NOW()
    `

    // Record bid in history
    await sql`
      INSERT INTO bid_history (player_id, team_id, bid_amount)
      VALUES (${state.current_player_id}, ${teamId}, ${bidAmount})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error placing bid:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
