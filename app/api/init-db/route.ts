import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Check if tables exist
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    return NextResponse.json({
      success: true,
      message: "Database initialized",
      tables: result,
    })
  } catch (error) {
    console.error("[v0] Database init error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
