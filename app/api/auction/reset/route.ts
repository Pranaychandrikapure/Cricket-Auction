import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Clear sold players
    await sql`DELETE FROM sold_players`

    // Clear bid history
    await sql`DELETE FROM bid_history`

    // Reset team budgets
    await sql`UPDATE teams SET remaining_budget = total_budget`

    // Reset magic cards
    await sql`UPDATE magic_cards SET is_used = FALSE, used_at = NULL`

    // Reset auction state
    await sql`
      UPDATE auction_state 
      SET 
        current_player_id = NULL,
        current_bid = NULL,
        current_team_id = NULL,
        state = 'idle',
        countdown_seconds = 10,
        is_magic_card = FALSE,
        magic_card_type = NULL,
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error resetting auction:", error)
    return NextResponse.json({ error: "Failed to reset auction" }, { status: 500 })
  }
}
