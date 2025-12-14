import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await sql`UPDATE auction_state SET state = 'paused', updated_at = NOW()`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error pausing auction:", error)
    return NextResponse.json({ error: "Failed to pause auction" }, { status: 500 })
  }
}
