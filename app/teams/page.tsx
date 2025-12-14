import { sql } from "@/lib/db"
import { TeamDashboard } from "@/components/team-dashboard"
import { requireAuth } from "@/lib/auth"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function getTeamData(teamId: number) {
  const teams = await sql`SELECT * FROM teams WHERE id = ${teamId}`
  return teams.length > 0 ? teams[0] : null
}

export default async function TeamsPage() {
  const user = await requireAuth("team_owner")

  if (!user.team_id) {
    redirect("/login")
  }

  const team = await getTeamData(user.team_id)

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-white">Team not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-4xl font-bold text-white">{team.name} - Owner Dashboard</h1>
            <p className="text-purple-300 mt-1">Logged in as: {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <button className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Home
              </button>
            </Link>
            <LogoutButton />
          </div>
        </div>
        <TeamDashboard team={team} isLocked={true} />
      </div>
    </div>
  )
}
