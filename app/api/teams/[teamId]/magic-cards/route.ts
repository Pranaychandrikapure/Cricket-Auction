import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const cards = await sql`
      SELECT * FROM magic_cards 
      WHERE team_id = ${teamId}
      ORDER BY card_type
    `

    return NextResponse.json(cards)
  } catch (error) {
    console.error("[v0] Error fetching magic cards:", error)
    return NextResponse.json({ error: "Failed to fetch magic cards" }, { status: 500 })
  }
}
