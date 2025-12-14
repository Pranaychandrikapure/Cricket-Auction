import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const players = await sql`SELECT * FROM players ORDER BY name`
    return NextResponse.json({ players })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, batting_style, bowling_style, base_price, description, photo_url } = body

    const result = await sql`
      INSERT INTO players (name, email, role, batting_style, bowling_style, base_price, description, photo_url)
      VALUES (${name}, ${email}, ${role}, ${batting_style}, ${bowling_style}, ${base_price}, ${description}, ${photo_url})
      RETURNING *
    `

    return NextResponse.json({ player: result[0] })
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
