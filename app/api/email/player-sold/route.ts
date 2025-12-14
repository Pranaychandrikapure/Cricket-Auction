import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/* CHECK SOLD + EMAIL STATUS */
export async function POST(req: NextRequest) {
  try {
    const { playerId } = await req.json()

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    // 1️⃣ Check if player is actually sold in the DB
    // Assuming sold_player table has the sold records
    const soldData = await sql`
      SELECT player_id
      FROM sold_player
      WHERE player_id = ${playerId}
      LIMIT 1
    `

    if (soldData.length === 0) {
      return NextResponse.json({
        isSold: false,
        emailSent: false,
      })
    }

    // 2️⃣ Check if email was already sent
    const emailData = await sql`
      SELECT email_sent
      FROM player_email_status
      WHERE player_id = ${playerId}
      LIMIT 1
    `

    const emailSent = emailData.length > 0 ? emailData[0].email_sent : false

    return NextResponse.json({
      isSold: true,
      emailSent: emailSent,
    })
  } catch (error) {
    console.error("Database error in check status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/* MARK EMAIL AS SENT */
export async function PUT(req: NextRequest) {
  try {
    const { playerId } = await req.json()

    if (!playerId) return NextResponse.json({ error: "ID missing" }, { status: 400 })

    await sql`
      INSERT INTO player_email_status (player_id, email_sent, email_sent_at)
      VALUES (${playerId}, true, NOW())
      ON CONFLICT (player_id)
      DO UPDATE
      SET email_sent = true,
          email_sent_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error in update status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}