import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { setUserCookie } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const users = await sql`
      SELECT id, email, role, team_id, password_hash
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // For demo purposes, we're using a simple password check
    // In production, use bcrypt to compare hashed passwords
    const validPassword = password === "admin123" || password === "owner123"

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set user cookie
    const userdata = {
      id: user.id,
      email: user.email,
      role: user.role,
      team_id: user.team_id,
    }

    await setUserCookie(userdata)

    return NextResponse.json({ user: userdata })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
