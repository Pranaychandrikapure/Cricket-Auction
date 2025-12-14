import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Sell route called")

    // 1. Get current auction state
    const auctionState = await sql`SELECT * FROM auction_state LIMIT 1`
    const state = auctionState[0]

    if (!state.current_player_id) {
      return NextResponse.json({ error: "No player in auction" }, { status: 400 })
    }

    let teamId = state.current_team_id
    let finalPrice = Number(state.current_bid || 0)

    // 2. Logic to handle "Sold" without a bid (checking history)
    if (!teamId || finalPrice === 0) {
      console.log("[v0] No current_team_id, checking bid history")
      const highestBidResult = await sql`
        SELECT team_id, bid_amount 
        FROM bid_history 
        WHERE player_id = ${state.current_player_id}
        ORDER BY bid_amount DESC, created_at DESC
        LIMIT 1
      `

      if (highestBidResult.length === 0) {
        return NextResponse.json({ error: "No bids found for this player" }, { status: 400 })
      }

      teamId = highestBidResult[0].team_id
      finalPrice = Number(highestBidResult[0].bid_amount)
    }

    // 3. Get Details
    const playerResult = await sql`SELECT * FROM players WHERE id = ${state.current_player_id}`
    const teamResult = await sql`SELECT * FROM teams WHERE id = ${teamId}`
    const player = playerResult[0]
    const team = teamResult[0]

    if (!player || !team) {
      return NextResponse.json({ error: "Player or team not found" }, { status: 404 })
    }

    const isPremiumPlayer = finalPrice > 10

    // ============================================================
    // 4. DATABASE UPDATES
    // ============================================================

    // A. Record the sale
    await sql`
      INSERT INTO sold_players (player_id, team_id, final_price, is_premium_player)
      VALUES (${state.current_player_id}, ${teamId}, ${finalPrice}, ${isPremiumPlayer})
    `

   // B. Initialize Email Status
    await sql`
      INSERT INTO player_email_status (player_id, email_sent, email_sent_at)
      VALUES (${state.current_player_id}, false, NULL)
      ON CONFLICT (player_id)
      DO UPDATE SET 
        email_sent = false,
        email_sent_at = NULL
    `

    // C. Update team budget
    await sql`
      UPDATE teams 
      SET 
        remaining_budget = remaining_budget - ${finalPrice},
        has_premium_player = CASE 
          WHEN ${isPremiumPlayer} THEN TRUE 
          ELSE has_premium_player 
        END
      WHERE id = ${teamId}
    `

    // D. Reset auction state
    await sql`
      UPDATE auction_state 
      SET 
        current_player_id = NULL,
        current_bid = NULL,
        current_team_id = NULL,
        state = 'sold',
        is_magic_card = FALSE,
        magic_card_type = NULL,
        updated_at = NOW()
    `

    console.log("[v0] Player sold successfully:", { player: player.name, team: team.name, price: finalPrice })

    // Auto-reset to idle after 3 seconds (Optional, can be removed if frontend handles it)
    setTimeout(async () => {
      // Note: In serverless, timeouts aren't guaranteed to finish if the function returns early, 
      // but keeping it as per your original logic.
      try {
        await sql`UPDATE auction_state SET state = 'idle', updated_at = NOW()`
      } catch (e) {
        console.error("Failed to reset to idle", e)
      }
    }, 3000)

    return NextResponse.json({ 
        success: true, 
        team: team.name, 
        price: finalPrice 
    })

  } catch (error) {
    console.error("[v0] Error selling player:", error)
    return NextResponse.json({ error: "Failed to sell player" }, { status: 500 })
  }
}