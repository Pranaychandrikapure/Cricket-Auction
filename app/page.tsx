import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Tv, Users, LogIn, Trophy } from "lucide-react"
import { getUser } from "@/lib/auth"
import { LogoutButton } from "@/components/logout-button"

export default async function HomePage() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NeML Cricket Auction</h1>
                <p className="text-xs text-muted-foreground">Real-time Player Bidding</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.email}</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login">
                  <Button>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Manage auctions and control bidding</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full" disabled={!user || user.role !== "admin"}>
                  Open Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Tv className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Live Auction</CardTitle>
              <CardDescription>Watch bidding with real-time updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auction">
                <Button className="w-full bg-transparent" variant="outline">
                  View Live
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Team Dashboard</CardTitle>
              <CardDescription>Place bids and manage your squad</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teams">
                <Button className="w-full" variant="secondary" disabled={!user || user.role !== "team_owner"}>
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Bidding</h3>
                  <p className="text-sm text-muted-foreground">Instant updates across all screens</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Tv className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Live Display</h3>
                  <p className="text-sm text-muted-foreground">Dramatic countdown and animations</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Magic Cards</h3>
                  <p className="text-sm text-muted-foreground">Special abilities for strategic play</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Budget Control</h3>
                  <p className="text-sm text-muted-foreground">Automatic spending management</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
