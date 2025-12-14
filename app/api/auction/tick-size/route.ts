import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { tickSize } = await request.json()

    await sql`
      UPDATE auction_state
      SET tick_size = ${tickSize}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating tick size:", error)
    return NextResponse.json({ error: "Failed to update tick size" }, { status: 500 })
  }
}
