import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { playerId, countdownSeconds, isMagicCard, magicCardType } = await request.json()

    // Get player details
    const player = await sql`SELECT * FROM players WHERE id = ${playerId}`
    if (player.length === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Update auction state
    await sql`
      UPDATE auction_state 
      SET 
        current_player_id = ${playerId},
        current_bid = ${player[0].base_price},
        current_team_id = NULL,
        state = 'active',
        countdown_seconds = ${countdownSeconds},
        is_magic_card = ${isMagicCard},
        magic_card_type = ${magicCardType},
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error starting auction:", error)
    return NextResponse.json({ error: "Failed to start auction" }, { status: 500 })
  }
}
