import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { cardId, teamId } = await request.json()

    // Check if card exists and belongs to team
    const card = await sql`
      SELECT * FROM magic_cards 
      WHERE id = ${cardId} AND team_id = ${teamId} AND is_used = FALSE
    `

    if (card.length === 0) {
      return NextResponse.json({ error: "Magic card not available" }, { status: 400 })
    }

    const cardType = card[0].card_type

    // Get current auction state
    const auctionState = await sql`SELECT * FROM auction_state LIMIT 1`
    const state = auctionState[0]

    if (state.state !== "active") {
      return NextResponse.json({ error: "Auction is not active" }, { status: 400 })
    }

    // Apply magic card effect
    switch (cardType) {
      case "extra_time":
        await sql`
          UPDATE auction_state 
          SET countdown_seconds = countdown_seconds + 10
        `
        break

      case "steal_bid":
        // Steal the current bid
        await sql`
          UPDATE auction_state 
          SET current_team_id = ${teamId}
        `
        await sql`
          INSERT INTO bid_history (player_id, team_id, bid_amount)
          VALUES (${state.current_player_id}, ${teamId}, ${state.current_bid})
        `
        break

      case "double_or_nothing":
        // Implementation depends on rules - for now, just mark as used
        break
    }

    // Mark card as used
    await sql`
      UPDATE magic_cards 
      SET is_used = TRUE, used_at = NOW()
      WHERE id = ${cardId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error using magic card:", error)
    return NextResponse.json({ error: "Failed to use magic card" }, { status: 500 })
  }
}
