import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await sql`UPDATE auction_state SET state = 'active', updated_at = NOW()`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error resuming auction:", error)
    return NextResponse.json({ error: "Failed to resume auction" }, { status: 500 })
  }
}
